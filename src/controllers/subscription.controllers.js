import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }

  // Unsubscribe if subscribed (delete the subscription document if found)
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

  if (subscribersList?.length === 0) {
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

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber id");
  }

  const subscriptionList = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel");

  if (subscriptionList?.length === 0) {
    throw new ApiError(400, "No channels found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Subsribed channels fetched successfully",
        subscriptionList
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };

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
