import mongoose from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      throw new ApiError(500, "Tweet cannot be empty");
    }
    const newTweet = await Tweet.create({
      content: content,
      owner: new mongoose.Types.ObjectId(req.user._id),
    });
    res.status(201).json(new ApiResponse(201, newTweet, "Tweet published"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error publishing tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const tweets = await Tweet.find({
      owner: new mongoose.Types.ObjectId(req.user._id),
    }).select("-owner");
    res.status(200).json(new ApiResponse(200, tweets, "Tweet fetched"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error getting tweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      throw new ApiError(500, "Tweet cannot be empty");
    }
    const tweet = await Tweet.findOneAndUpdate(
      {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
      {
        content: content,
      },
      { new: true }
    );
    res.status(200).json(new ApiResponse(200, tweet, "Tweet updated"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error updating tweets");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    if (!tweetId) {
      throw new ApiError(500, "Tweet id is required");
    }
    await Tweet.findByIdAndDelete(tweetId);
    res.status(200).json(new ApiResponse(200, {}, "Tweet is deleted"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error deleting tweets");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
