import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
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

  //you will find all the file details in the req.files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
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

export default registerUser;
