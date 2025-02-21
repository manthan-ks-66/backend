import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { mongoose, isValidObjectId } from "mongoose";

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
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid or missing user id");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  if (!userPlaylists) {
    throw new ApiError(400, "No playlists found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Playlists fetched successfully", userPlaylists)
    );
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
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", userPlaylist));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // add single video to the playlist
  const { playlistId, videoId } = req.params;

  if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
    throw new ApiError(400, "Invalid id");
  }

  const updatedPlaylist = await Playlist.updateOne(
    {
      _id: new mongoose.Types.ObjectId(playlistId),
    },
    {
      $push: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Video added to the playlist", updatedPlaylist));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
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

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // remove single video from the playlist
  const { playlistId, videoId } = req.params;

  if (!(isValidObjectId(playlistId) && isValidObjectId(videoId))) {
    throw new ApiError(400, "Invalid Id");
  }

  const updatedPlaylist = await Playlist.updateOne(
    {
      _id: new mongoose.Types.ObjectId(playlistId),
    },
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video removed from the playlist", updatedPlaylist)
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiError(400, "Name and description is required");
  }

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Playlist updated successfully", updatedPlaylist)
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(204)
    .json(new ApiResponse(204, "Playlist deleted successfully", {}));
});

export {
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  getPlaylistById,
  getUserPlaylists,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  createPlaylistFromVideos,
};
