import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getVideoById,
  publishVideo,
  updateVideo,
  getAllVideos,
  togglePublishStatus,
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
  publishVideo
);

router.route("/channel/delete-video/:videoId").get(verifyJWT, deleteVideo);
router.route("/:videoId").get(getVideoById);
router
  .route("/update/:videoId")
  .patch(verifyJWT, upload.single("thumbnail"), updateVideo);

router.route("/all-videos").post(getAllVideos);
router.route("/toggle-publish/:videoId").get(verifyJWT, togglePublishStatus);

export default router;
