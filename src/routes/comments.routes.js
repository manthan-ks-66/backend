import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  updateComment,
  getVideoComments,
} from "../controllers/comments.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// middleware
router.use(upload.none());
router.use(verifyJWT);

router.route("/:videoId/add-comment").post(addComment);

router.route("/:commentId/update-comment").patch(updateComment);

router.route("/:videoId/get-all-comments").get(getVideoComments);

export default router;
