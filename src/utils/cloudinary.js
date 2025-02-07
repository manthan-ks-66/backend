import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

//configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file uploaded successfully
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove temporary file from the server if upload fails
    console.log(error);
    fs.unlinkSync(localFilePath);
  }
};

export { uploadOnCloudinary };
