import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { mongoose } from "mongoose";

// changes the date in mm:ss format
function formatDuration(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const uploadVideo = asyncHandler(async (req, res) => {
  /* ALGO: upload user video
   * get video details from req.body and req.files
   * check if any of the video details are missing
   * get the cloudinary url for video file and thumbnail
   * check if the cloudinary url exist
   * create video object
   * check if object created
   * return res */

  const { title, description } = req.body;

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!title || !description) {
    throw new ApiError(400, "all fields are required");
  }

  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video file or thumbnail is missing");
  }
  console.log(videoFileLocalPath, thumbnailLocalPath);

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiError(500, "error while uploading the files");
  }

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    title,
    description,
    duration: formatDuration(videoFile.duration),
  });

  if (!video) {
    throw new ApiError(500, "internal server error please try again");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "video uploaded successfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  /* ALGO: delete video
   * get video id from req.params
   * check if video id exists
   * mongoose find by id and delete
   * return res */

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is missing");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, "video deleted successfully", {}));
});

const getVideoById = asyncHandler(async (req, res) => {
  /* ALGO: get video using id
   * get video id from req.params
   * check if video id exists
   * use mongodb aggregation pipeline to get video along with owner details
   * check if video response returned by mongoose
   * return res */

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is missing");
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
    .json(new ApiResponse(200, "video fetched successfully", video[0]));
});

const updateVideo = asyncHandler(async (req, res) => {
  /* ALGO: update video details title, description, thumbnail
   * get video id from req.params
   * check if video id exists
   * get title, description from req.body
   * get thumbnail from req.files
   * check for title, description and thumbnail
   * upload thumbnail on cloudinary and get the url
   * check for thumbnail url
   * update required details using findByIdAndUpdate
   * return res */

  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is missing");
  }

  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;
  if (!title || !description) {
    throw new ApiError(400, "all fields are required");
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
    .json(new ApiResponse(200, "video updated successfully", updatedVideo));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  /* ALGO: toggle the isPublished field of video as true or falsse
   * get video id from req.params
   *  */
});

const getAllVideos = asyncHandler(async (req, res) => {
  /* ALGO: get all videos */
});

export {
  uploadVideo,
  getAllVideos,
  deleteVideo,
  getVideoById,
  updateVideo,
  togglePublishStatus,
};
