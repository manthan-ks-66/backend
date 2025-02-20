import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { isValidObjectId } from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const { content } = req.body;

  if (!(isValidObjectId(videoId) && content)) {
    throw new ApiError(400, "Invalid id or content is missing");
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
    .status(200)
    .json(new ApiResponse(200, "Comment added successfully", comment));
});

export { addComment };
