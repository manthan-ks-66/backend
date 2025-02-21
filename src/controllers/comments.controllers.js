import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { isValidObjectId } from "mongoose";

// TODO: postman testing
const getVideoComments = asyncHandler(async (req, res) => {
  // get all comments for a video
  const { videoId } = req.params;

  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Video id is invalid or missing");
  }

  const comments = await Comment.find({ owner: req.user._id })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  if (comments.length === 0) {
    throw new ApiError(400, "No comments found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comments fetched successfully", comments));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video Id");
  }

  if (!content) {
    throw new ApiError(400, "Content is missing");
  }

  const comment = await Comment.create({
    content: content,
    video: videoId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(500, "Internal server error please try again");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", comment));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Id");
  }

  if (!content) {
    throw new ApiError(400, "Content field is empty");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

export { addComment, updateComment, getVideoComments };
