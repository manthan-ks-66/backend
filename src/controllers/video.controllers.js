import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import mongoose, { isValidObjectId } from "mongoose";

// changes the date in mm:ss format
function formatDuration(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // get all videos based on query, sort, pagination

  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!query) {
    throw new ApiError(400, "Query is required to filter the videos");
  }

  const sortOptions = {};
  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const filter = {
    title: { $regex: query, $options: "i" },
    ...(userId && { owner: userId }),
  };

  const totalVideos = await Video.countDocuments(filter);

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  if (videos?.length === 0) {
    throw new ApiError(400, "No videos found");
  }

  const apiBaseUrl = "/videos/get-all-videos?";
  const apiNextPage = `page=${Number(page) + 1}&limit=${limit}&query=${query}`;
  const apiPrevPage = `page=${Number(page) - 1}&limit=${limit}&query=${query}`;
  const userIdParam = userId ? `&userId=${userId}` : "";

  const nextPage = `${apiBaseUrl}${apiNextPage}&sortBy=${sortBy}&sortType=${sortType}${userIdParam}`;
  const prevPage = `${apiBaseUrl}${apiPrevPage}&sortBy=${sortBy}&sortType=${sortType}${userIdParam}`;

  const data = {
    videos,
    totalVideos,
    page: Number(page),
    hasNextPage: page * limit < totalVideos,
    hasPrevPage: page > 1,
    nextPage: page * limit < totalVideos ? nextPage : null,
    prevPage: page > 1 ? prevPage : null,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", data));
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video file or thumbnail is missing");
  }

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiError(500, "Error while uploading the files");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    title: title,
    description: description,
    duration: formatDuration(videoFile.duration),
  });

  if (!video) {
    throw new ApiError(500, "Internal server error please try again");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video published successfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully", {}));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videoOwner",
        pipeline: [
          // TODO: try $ project outside of $ lookup pipeline
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        videoOwner: {
          $first: "$videoOwner",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", video[0]));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;
  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail?.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", updatedVideo));
});

// TODO: postman testing
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is missing");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    {
      new: true,
    }
  );

  return res.status(200).json(new ApiResponse(200, "video toggled", {}));
});

export {
  publishVideo,
  getAllVideos,
  deleteVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
};

/*const filter = {
  title: { $regex: query, $options: "i" },
  userId: userId ? userId : null,

  NOTE: this approach always includes userId in the filter object whether its null or  
  filled and the mongodb find() method accepts object that has value to fetch data and if
  there is no value it gives an error better to use spread operator with logical && 


  } */
