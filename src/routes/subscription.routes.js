import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getUserChannelSubscribers,
  getUserChannelSubscribers,
} from "../controllers/subscription.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId/toggle-subscription").get(getUserChannelSubscribers);

router
  .route("/:channelId/get-channel-subscribers")
  .get(getUserChannelSubscribers);

export default router;
