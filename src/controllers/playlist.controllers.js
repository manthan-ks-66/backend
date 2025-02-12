import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    /* ALGO: create playlist
     * get playlist details from req.body 
     * check if any details are missing 
     * first pipeline: match with playlist id
     */
})
