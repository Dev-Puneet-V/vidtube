import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { Tweet } from "../models/tweet.models.js";
const getComments = asyncHandler(async (req, res) => {
  try {
    try {
      const { page = 1, limit = 10, parentType } = req.query;
      const { parentId } = req.params;
      if (!["Video", "Comment", "Tweet"].includes(parentType)) {
        throw new ApiError(500, "Invalid parent content type");
      }
      console.log(parentId, parentType);
      let skip = (page - 1) * limit;
      const comments = await Comment.aggregate([
        {
          $match: {
            parent: new mongoose.Types.ObjectId(parentId),
            parentType: parentType,
          },
        },
        {
          //this is a good query, took help from chatgpt
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "user",
          },
        },
        //   unwind because there will be only 1 targetData at a time, so dont need array
        { $unwind: "$user" },
        {
          $project: {
            _id: 1,
            parent: 1,
            parentType: 1,
            content: 1,
            "user._id": 1,
            "user.username": 1,
            "user.email": 1,
            "user.fullname": 1,
            "user.avatar": 1,
            "user.coverImage": 1,
          },
        },
        { $limit: skip + +limit },
        { $skip: skip },
      ]);
      res
        .status(200)
        .json(new ApiResponse(200, comments, "Successfully fetched comments"));
    } catch (error) {
      console.log(error);
      throw new ApiError(500, "Error in fetching comment");
    }
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error fetching comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { parentType } = req.query;
    const { parentId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) {
      throw new ApiError(500, "Comment cannot be empty");
    }
    const validTypes = { Video, Tweet, Comment };
    const Model = validTypes[parentType];
    if (!Model) throw new ApiError(500, "Invalid resource type");
    const parent = await Model.findById(parentId);
    if (!parent) {
      throw new ApiError(500, "Parent content not found");
    }
    const newComment = await Comment.create({
      parent: new mongoose.Types.ObjectId(parentId),
      parentType: parentType,
      owner: new mongoose.Types.ObjectId(req.user._id),
      content: content,
    });
    res
      .status(200)
      .json(new ApiResponse(200, newComment, "Comment created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error adding comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) {
      throw new ApiError(500, "Comment cannot be empty");
    }
    const updatedComment = await Comment.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(commentId),
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
      { content: content },
      { new: true }
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error updating comment");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    await Comment.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(commentId),
      owner: new mongoose.Types.ObjectId(req.user._id),
    });
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment deleted successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error deleting comment");
  }
});

export { getComments, addComment, updateComment, deleteComment };
