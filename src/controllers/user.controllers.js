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

const registerUser = asyncHandler(async (req, res) => {
  // ALGORITHM: register user
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

const loginUser = asyncHandler(async (req, res) => {
  // ALGORITHM: login user
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
      $set: { refreshToken: undefined },
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
  // ALGORITHM: refresh the access token

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
    res
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

export { loginUser, registerUser, logoutUser, refreshAccessToken };
