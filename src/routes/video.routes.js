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

router.route("/toggle-publish/:videoId").patch(verifyJWT, togglePublishStatus);
router.route("/get-all-videos").post(getAllVideos);

export default router;
