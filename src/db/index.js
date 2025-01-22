import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

const app = express();
dotenv.config({
  path: "./.env",
});

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    console.log("MongoDB Connected successfully");

    app.on("error", (error) => {
      console.log("ERROR: ", error);
      throw error;
    });
  } catch (error) {
    console.log("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;
