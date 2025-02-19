import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getPlaylistById,
  createPlaylist,
  createPlaylistFromVideos,
} from "../controllers/playlist.controllers.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlaylist);
router.route("/add-videos-playlist").post(verifyJWT, createPlaylistFromVideos);
router.route("/get-playlist/:playlistId").get(getPlaylistById);

export default router;
