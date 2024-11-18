import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, duration } = req.body;
  //isNaN checks here if it is number or not
  if (!title || !description || isNaN(duration)) {
    throw new ApiError(500, "Title, description or duration format is invalid");
  }
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  let video = "";
  let thumbnail = "";
  try {
    video = await uploadOnCloudinary(videoFileLocalPath);
    console.log("Video uploaded", video);
  } catch (error) {
    console.log("Error uploading video", error);
    throw new ApiError(500, "Failed to upload video");
  }
  try {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    console.log("Thumbnail uploaded", thumbnail);
  } catch (error) {
    console.log("Error uploading thumbnail", error);
    throw new ApiError(500, "Failed to upload thumbnail");
  }
  try {
    const publishedVideo = await Video.create({
      videoFile: video.url,
      thumbnail: thumbnail.url,
      title,
      description,
      duration: +duration,
      owner: new mongoose.Types.ObjectId(req.user._id),
    });
    return res
      .status(201)
      .json(
        new ApiResponse(200, publishedVideo, "Video published successfully")
      );
  } catch (error) {
    console.log(error);
    if (thumbnail) {
      await deleteFromCloudinary(thumbnail.public_id);
    }
    if (video) {
      await deleteFromCloudinary(video.public_id);
    }
    throw new ApiError(500, "Failed to publish video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(500, "video id cant be null");
  }
  const video = await Video.findById(new mongoose.Types.ObjectId(videoId));
  res
    .status(200)
    .json(new ApiResponse(200, video, "Video details fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description } = req.body;
    if (!videoId) {
      throw new ApiError(500, "video id cant be null");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(500, "video not found");
    }
    let thumbnail = req.file?.path;
    let newThumbnail = "";
    if (thumbnail) {
      try {
        newThumbnail = await uploadOnCloudinary(thumbnail);
        video.thumbnail = newThumbnail.url;
      } catch (err) {
        throw new ApiError(500, "unable to upload thumbnail");
      }
    }
    if (title) {
      video.title = title;
    }
    if (description) {
      video.description = description;
    }
    let updatedVideo = await video.save({ new: true });
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedVideo, "Video details updated successfully")
      );
  } catch (err) {
    console.log(err);
    throw new ApiError(500, "unable to update video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
