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

const getLikedContent = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, type } = req.query;
    if (!["Video", "Comment", "Tweet"].includes(type)) {
      throw new ApiError(500, "Invalid content type");
    }
    let skip = (page - 1) * limit;
    const likes = await Like.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          targetType: type,
        },
      },
      {
        //this is a good query, took help from chatgpt
        $lookup: {
          from: type.toLowerCase() + "s",
          localField: "targetId",
          foreignField: "_id",
          as: "targetData",
        },
      },
    //   unwind because there will be only 1 targetData at a time, so dont need array
      { $unwind: "$targetData" },
      { $limit: skip + +limit },
      { $skip: skip },
    ]);
    console.log(likes);
    res
      .status(200)
      .json(new ApiResponse(200, likes, "Successfully fetched likes"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error in fetching liked content");
  }
});

export { toggleLike, getLikedContent };
