import mongoose from "mongoose";
import { Comment } from "../models/comment.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Video} from "../models/video.models.js";
import {Tweet} from "../models/tweet.models.js";
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
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
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
