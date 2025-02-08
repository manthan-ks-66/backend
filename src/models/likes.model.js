import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  //
});

export const Like = mongoose.model("Like", likeSchema);
