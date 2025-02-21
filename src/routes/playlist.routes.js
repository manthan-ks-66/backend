import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  deletePlaylist,
  updatePlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  createPlaylistFromVideos,
} from "../controllers/playlist.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(upload.none());

router.route("/create-playlist").post(verifyJWT, createPlaylist);

router
  .route("/create-videos-playlist")
  .post(verifyJWT, createPlaylistFromVideos);

router.route("/get-playlist/:playlistId").get(getPlaylistById);

router
  .route("/add-video-playlist/:playlistId/:videoId")
  .patch(verifyJWT, addVideoToPlaylist);

router
  .route("/remove-video-from-playlist/:playlistId/:videoId")
  .patch(verifyJWT, removeVideoFromPlaylist);

router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);

router.route("/update-playlist/:playlistId").patch(verifyJWT, updatePlaylist);

router.route("/get-user-playlists/:userId").get(verifyJWT, getUserPlaylists);

export default router;
