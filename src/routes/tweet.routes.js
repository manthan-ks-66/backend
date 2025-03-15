import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-tweet").post(createTweet);

router.route("/:userId/user-tweets").get(getUserTweets);

router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default router;
