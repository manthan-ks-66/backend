import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is missing");
  }

  const tweet = await Tweet.create({
    owner: req.user._id,
    content: content,
  });

  if (!tweet) {
    throw new ApiError(500, "There was an error creating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet created successfully", tweet));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid or missing user id");
  }

  const userTweets = await Tweet.find({ owner: userId });

  if (userTweets.length === 0 || !userTweets) {
    throw new ApiError(400, "No tweets found");
  }

  return res
    .status(200)
    .json(200, "User tweets fetched successfully", userTweets);
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;

  const { newContent } = req.body;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet id is invalid or missing");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, {
    $set: {
      content: newContent,
    },
  });

  if (!updatedTweet) {
    throw new ApiError(500, "There was an error updating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet updated successfully", updateTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet id is invalid or missing");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(204)
    .json(new ApiResponse(204, "Tweet deleted successfully", {}));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
