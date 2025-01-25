// middleware to delete old avatar and cover image

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const deleteOldAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.avatar = null;
    await user.save({ validateBeforeSave: false });
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error?.message || "Internal Server Error");
  }
};

// delete old cover image
const deleteOldCoverImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.coverImage = null;
    await user.save({ validateBeforeSave: false });
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
};

export { deleteOldAvatar, deleteOldCoverImage };
