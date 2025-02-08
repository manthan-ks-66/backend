import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// http cookie options:
const options = {
  httpOnly: true,
  secured: true,
};

// generates access and refresh tokens for authentication
const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // store the refreshToken to the user object
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "something went wrong please try again later");
  }
};

// register user: (sign up)
const registerUser = asyncHandler(async (req, res) => {
  // ALGO: register user
  // 1. get user details from frontend
  const { email, username, fullName, password } = req.body;
  console.log("req.body: \n", req.body);

  // validation - check for empty fields - username, fullName, email, password
  if (
    // some is an array method if any one of the value passes test statement of cb it returns true
    [fullName, username, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 2. check if user already exists
  const existedUser = await User.findOne({ $or: [{ username, email }] });
  if (existedUser) {
    throw new ApiError(409, "User already exists please login");
  }

  // 3. check for cover image and avatar (validation)
  console.log("\n req.files: \n", req.files);

  // you will find all the file details in the req.files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  let coverImageLocalPath = "";
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(409, "Avatar is required please upload your avatar.");
  }

  // 4. upload image and avatar on cloudinary and get the url
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "Avatar is required please upload your avatar.");
  }

  // 5. create user object in db
  const user = await User.create({
    username,
    email,
    fullName,
    avatar: avatar.url,
    // check statement for coverImage hence if no url is provided use empty string
    coverImage: coverImage?.url || "",
    password,
  });

  // 6. remove password and refresh token from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // 7. check for user created in the db
  if (!createdUser) {
    throw new ApiError(500, "Internal server error please try again");
  }
  // 8. return response (server response)
  return res
    .status(201)
    .json(new ApiResponse(200, "User registered successfully", createdUser));
});

// login user:
const loginUser = asyncHandler(async (req, res) => {
  // ALGO: login user
  // get user details from req.body
  const { username, password } = req.body;
  console.log(username, password);

  // check for username and password
  if (!username || !password) {
    throw new ApiError(400, "Username and password is required");
  }

  // find the user in db
  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(401, "user does not exist please sign up");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  console.log(isPasswordValid);
  // generate access and refresh token
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookie
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(
    userId,
    {
      $unset: {
        refreshToken: 1, // this removes the field from the document
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

// end point for refreshing access token to keep user authenticated
const refreshAccessToken = asyncHandler(async (req, res) => {
  // ALGO: refresh the access token

  // get refresh token from the cookies
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.cookies?.refreshToken;

  // check refresh token is availabe or not
  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized request");
  }
  try {
    // check the incoming refresh token matches with the cookie refresh token from jwt verify
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // find the user in db from the decoded token
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(400, "Invalid refresh token");
    }

    // check decoded token matches with the user refresh token of db
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(400, "refresh token is expired");
    }
    // generate the refresh token and acces token
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    // send access token and refresh token to the cookie
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(200, "access token refreshed", {
          accessToken,
          refreshToken,
        })
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(401, error?.message);
  }
});

// update user password:
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // ALGO: change password

  // get old & new passwords from req.body
  // check if passwords exists
  // check if user password is correct
  // check if new password matches with confirm password
  // update password on db
  // return res
  const { oldPassword, newPassword, confPassword } = req.body;

  if (!oldPassword || !newPassword || !confPassword) {
    throw new ApiError(400, "all fields are required");
  }

  // db call:
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  if (!(newPassword === confPassword)) {
    throw new ApiError(400, "please enter matching password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  return res
    .status(200)
    .json(new ApiResponse(200, "password changed successfully", {}));
});

// change user account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  //  ALGO: update user details

  // get updation details from req.body
  // update the user details from mongoose findByIdAndUpdate
  const { fullName, email, username } = req.body;

  if (!fullName || !email || !username) {
    throw new ApiError(400, "all fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username: username,
        email: email,
        fullName: fullName,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, "user details updated successfully", user));
});

// update avatar
const changeUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files.avatar[0].path;
  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading the avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  res
    .status(200)
    .json(new ApiResponse(200, "Avatar updated successfully", user));
});

// change user cover image:
const changeCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.files.coverImage[0].path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "cover image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading the cover image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(200)
    .json(new ApiResponse(200, "cover image updated successfully", user));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // ALGO: get user channel profile using aggregate pipleline
  // get username from req.params
  // check if username exists
  // first pipeline: match with username
  // second pipeline: lookup to subscription schema for subscriber count
  // third pipeline: lookup to subscription schema for subscribedToCount
  // fourth pipeline: addFields subscribersCount and subscribedToCount and isSubscribed
  // fifth pipeline: project the required fields

  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "username does not exist");
  }

  const channel = await User.aggregate([
    {
      $match: username,
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        username: 1,
        email: 1,
        fullName: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel) {
    throw new ApiError(404, "channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "channel profile fetched successfully", channel)
    );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
  /* ALGO: get user watch history
   * first pipeline: match with user id
   *  second pipeline: lookup to video schema as watchHistory
   *  third - sub pipeline: lookup to user schema as owner 
              - sub pipeline: project for owner fullName, username, avatar
   * fourth pipeline: addFields owner */

  const user = await User.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!user) {
    throw new ApiError(400, "user not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "watch history fetched successfully",
        user[0].watchHistory
      )
    );
});

export {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  changeUserAvatar,
  changeCoverImage,
  getUserChannelProfile,
  getUserWatchHistory,
};
