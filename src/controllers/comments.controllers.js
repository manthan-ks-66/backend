import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { isValidObjectId } from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { content } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
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

export { addComment };
