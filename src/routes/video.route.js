import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getVideoById,
  uploadVideo,
  updateVideo,
} from "../controllers/video.controllers.js";

const router = Router();

router.route("/upload").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  uploadVideo
);

router.route("/channel/delete-video/:videoId").get(verifyJWT, deleteVideo);
router.route("/:videoId").get(getVideoById);
router
  .route("/update/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

export default router;
