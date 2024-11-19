import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";

const toggleLike = asyncHandler(async (req, res) => {
  try {
    const { targetId } = req.params;
    const { targetType } = req.query;
    const validTypes = { Video, Tweet, Comment };
    const Model = validTypes[targetType];
    if (!Model) throw new ApiError(500, "Invalid resource type");
    const content = await Model.findById(targetId);
    if (!content) throw new ApiError(404, "Resource not found");

    const likeFilter = {
      user: new mongoose.Types.ObjectId(req.user._id),
      targetId,
      targetType,
    };

    const likeUpdate = await Like.findOneAndUpdate(
      likeFilter,
      {},
      { upsert: true, new: false }
    );

    if (likeUpdate) await Like.deleteOne(likeFilter);

    res.status(200).json(new ApiResponse(200, {}, "Success"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error in operation");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleLike, getLikedVideos };
