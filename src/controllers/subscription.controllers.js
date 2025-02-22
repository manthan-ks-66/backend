import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  // un - subscribe if subscribed (delete the subscription document if found)
  const subscription = await Subscription.findOneAndDelete({
    subscriber: req.user._id,
    channel: channelId,
  });

  // subscribe if not subscription found (create subscription document)
  if (!subscription) {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Subscription status changed successfully", {}));
});

// controller to return channel's subscribers list
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  const subscribersList = await Subscription.find({
    channel: new mongoose.Types.ObjectId(channelId),
  }).populate("subscriber");

  if (subscribersList.length === 0) {
    throw new ApiError(400, "No subscribers found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subscribers list fetched successfully",
        subscribersList
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers };

// this approach will also work for toggleSubscription (my own logic)

// const userSubscribedChannel = await Subscription.findOne(
//   {
//     subscriber: req.user._id,
//     channel: channelId
//   }
// )

// if (!userSubscribedChannel) {
//   await Subscription.create({
//     subscriber: req.user._id,
//     channel: channelId,
//   });
// } else {
//   await Subscription.deleteOne({
//     subscriber: req.user._id,
//     channel: channelId,
//   });
// }
