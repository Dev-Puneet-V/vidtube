import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
// import { Subscription } from "../models/subscription.models.js";
// import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  try {
    const stats = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "videos",
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "videos._id",
          foreignField: "targetId",
          as: "likes",
        },
      },
      {
        $project: {
          username: 1,
          _id: 1,
          fullname: 1,
          avatar: 1,
          coverImage: 1,
          totalSubscribers: { $size: "$subscribers" },
          totalViews: { $sum: "$videos.views" },
          videos: { $size: "$videos" },
          totalLikes: { $size: "$likes" },
        },
      },
    ]);
    res
      .status(200)
      .json(new ApiResponse(200, stats, "Fetched channal stats successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error fetching channel stats");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  try {
  } catch (error) {
    throw new ApiError(500, "Error fetching channel video");
  }
});

export { getChannelStats, getChannelVideos };