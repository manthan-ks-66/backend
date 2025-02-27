import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controllers.js";

const router = Router();
router.use(verifyJWT);

// TODO: postman testing
router.route("/:videoId/toggle-video-like").get(toggleVideoLike);

router.route("/:commentId/toggle-comment-like").get(toggleCommentLike);

router.route("/:tweetId/toggle-tweet-like").get(toggleTweetLike);

router.route("/liked-videos").get(getLikedVideos);

export default router;
