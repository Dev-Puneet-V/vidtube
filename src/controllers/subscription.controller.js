import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const subscriber = new mongoose.Types.ObjectId(req.user?._id);
  const subscription = await Subscription.findOne({
    subscriber: subscriber,
    channel: new mongoose.Types.ObjectId(channelId),
  });
  let message = "";
  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);
    message = "Unsubscribed successfully";
  } else {
    const newSubscription = new Subscription({
      subscriber: subscriber,
      channel: new mongoose.Types.ObjectId(channelId),
    });
    await newSubscription.save();
    message = "Subscribed successfully";
  }
  return res.status(200).json(new ApiResponse(200, {}, message));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const channelInfo = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(subscriberId) },
    },
    {
      $group: {
        _id: "$channel",
        subscriberCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "channelInfo",
      },
    },
    {
      $unwind: "$channelInfo",
    },
    {
      $project: {
        _id: "$channelInfo._id",
        subscriberCount: 1,
        channelName: "$channelInfo.username",
        avatar: "$channelInfo.avatar",
        coverImage: "$channelInfo.coverImage",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, channelInfo[0], "Channel info fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const channelInfo = await Subscription.aggregate([
    {
      $match: { subscriber: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "channelInfo",
      },
    },
    {
      $unwind: "$channelInfo",
    },
    {
      $project: {
        _id: "$channelInfo._id",
        channelName: "$channelInfo.username",
        avatar: "$channelInfo.avatar",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelInfo,
        "Subscriber channel info list fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
