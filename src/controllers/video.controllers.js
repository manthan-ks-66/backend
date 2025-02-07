import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

function formatDuration(duration) {
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const uploadVideo = asyncHandler(async (req, res) => {
  /* ALGO: upload user video
   * get video details from req.body and req.files
   * check if any of the video details are missing
   * get the cloudinary url for vidoe file and thumbnail
   * check if the cloudinary url exist
   * create video object in db
   * check if object created ?
   * return res
   */

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

  if (!videoFile.url || !thumbnail.url) {
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

export { uploadVideo };
