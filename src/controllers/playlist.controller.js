import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description, privacy = "Public" } = req.body;
    const owner = new mongoose.Types.ObjectId(req.user._id);
    if (!name.trim() || !description.trim()) {
      throw new ApiError(500, "Name and description cant be empty");
    }
    if (!["Public", "Private"].includes(privacy)) {
      throw new ApiError(500, "Privacy of playlist can only be Public/Private");
    }
    const playlist = await Playlist.create({
      name,
      description,
      owner,
      videos: [],
      privacy,
      sharedUsers: [],
    });
    res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist created successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Errror creating playlist");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const owner = new mongoose.Types.ObjectId(req.user._id);
    const { videoId, playlistId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(500, "Video resource not found");
    }
    const playlist = await Playlist.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(playlistId), owner },
      {
        $addToSet: { videos: new mongoose.Types.ObjectId(videoId) },
      },
      {
        new: true,
      }
    ).populate("videos");
    res
      .status(200)
      .json(new ApiResponse(200, playlist, "Video added successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Errror creating playlist");
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
