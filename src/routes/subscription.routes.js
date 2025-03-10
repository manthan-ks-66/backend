import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controllers.js";

const router = Router();

router.use(verifyJWT);

// TODO: postman testing
router.route("/:channelId/toggle-subscription").get(toggleSubscription);

router
  .route("/:channelId/channel-subscribers-list")
  .get(getUserChannelSubscribers);

router.route("/:subscriberId/subscription-list").get(getSubscribedChannels);

export default router;
