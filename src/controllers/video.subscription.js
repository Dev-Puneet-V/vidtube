import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      query = "random",
      sortType = "descending",
      userId,
    } = req.query;
    const videoType = ["funny", "random"];
    if (!videoType.includes(query)) {
      throw new ApiError(500, "Invalid query, select from funny or random");
    }
    if (!["descending", "ascending"].includes(sortType)) {
      throw new ApiError(500, "Invalid sorting technique");
    }
    const skip = (+page - 1) * +limit;
    const videos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
          type: query,
        },
      },
      {
        $sort: {
          createdAt: sortType === "descending" ? -1 : 1,
        },
      },
      { $limit: skip + +limit },
      { $skip: skip },
    ]);
    res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Unable to fetch videos");
  }
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
    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    const video = await Video.findOne({
      _id: videoId,
      owner: currentUser,
    });

    if (!video) {
      throw new ApiError(500, "video not found");
    }
    let thumbnail = req.file?.path;
    let newThumbnail = "";
    if (thumbnail) {
      try {
        newThumbnail = await uploadOnCloudinary(thumbnail);
        const parts = thumbnail.split("/");
        const fileNameWithExtension = parts[parts.length - 1];
        const publicId = fileNameWithExtension.split(".")[0];
        await cloudinary.uploader.destroy(publicId);
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
    throw new ApiError(500, "unable to update video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      throw new ApiError(500, "video id cant be null");
    }

    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    const video = await Video.findOne({
      _id: videoId,
      owner: currentUser,
    });
    if (!video) {
      throw new ApiError(500, "video not found");
    }
    const thumbnailUrl = video?.thumbnail;
    const videoUrl = video?.videoFile;
    if (thumbnailUrl) {
      const publicId = getPublicIdFromUrl(thumbnailUrl);
      await deleteFromCloudinary(publicId);
    }
    if (videoUrl) {
      const publicId = getPublicIdFromUrl(videoUrl);
      await deleteFromCloudinary(publicId);
    }
    res.status(200).json(new ApiResponse(200, {}, "Video removed"));
  } catch (err) {
    throw new ApiError(500, "Unable to delete video");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      throw new ApiError(500, "video id cant be null");
    }

    const currentUser = new mongoose.Types.ObjectId(req.user._id);
    let video = await Video.findOne({
      _id: videoId,
      owner: currentUser,
    });
    if (!video) {
      throw new ApiError(500, "video published status cant be changed");
    }
    video.isPublished = !video.isPublished;
    video = await video.save();
    res.status(200).json(new ApiResponse(200, video, "Video status changed"));
  } catch (err) {
    console.log(err);
    throw new ApiError(500, "Unable to update video status");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
