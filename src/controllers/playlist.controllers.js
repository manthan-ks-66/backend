import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { isValidObjectId } from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const playlist = Playlist.create({
    name,
    description,
    videos: [],
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "playlist created successfully", playlist));
});

// create playlist from already uploaded videos by selecting multiple videos and creating new playlist
const createPlaylistFromVideos = asyncHandler(async (req, res) => {
  const { name, description, videos } = req.body;

  if (!name || !description || videos?.length === 0) {
    throw new ApiError(400, "All fields are required");
  }

  // check for valid mongodb object id
  for (let i = 0; i < videos.length; i++) {
    if (!isValidObjectId(videos[i])) {
      throw new ApiError(400, "Invalid video id");
    }
  }

  const userPlaylist = await Playlist.create({
    name,
    description,
    videos,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist created successfully", userPlaylist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !(isValidObjectId(playlistId) && isValidObjectId(videoId)) ||
    !playlistId ||
    !videoId
  ) {
    throw new ApiError(400, "Invalid id");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
    $set: {
      videos: videoId,
    },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Video added to the playlist", updatedPlaylist));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Video id is invalid or missing");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(400, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist fetched successfully", playlist));
});

export {
  createPlaylist,
  createPlaylistFromVideos,
  addVideoToPlaylist,
  getPlaylistById,
};
