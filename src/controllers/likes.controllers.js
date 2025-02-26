import { Like } from "../models/likes.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  // toggle like on video
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const likedVideo = await Like.findOne({
    likedBy: req.user._id,
    video: videoId,
  });

  // remove the video from the Like (un-like video)
  if (likedVideo) {
    await likedVideo.deleteOne();

    return res.status(200).json(new ApiResponse(200, "Video un-liked", {}));
  }

  // makes a new Like doc if no liked doc found (like a video)
  await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video liked successfully", {}));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  // toggle like on comment
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commend it passed");
  }

  const likedComment = await findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (likedComment) {
    await likedComment.deleteOne();
    return res.status(200).json(new ApiResponse(200, "Commment un-liked", {}));
  }

  await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment liked successfully", {}));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  // toggle like on tweet
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet it passed");
  }

  const likedTweet = await findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (likedTweet) {
    await likedTweet.deleteOne();
    return res.status(200).json(new ApiResponse(200, "Tweet un-liked", {}));
  }

  await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet liked successfully", {}));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.findById({
    likedBy: req.user._id,
  }).populate("video");

  if (likedVideos.length === 0) {
    throw new ApiError(400, "No liked videos found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Liked video fetched successfully", likedVideos)
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
