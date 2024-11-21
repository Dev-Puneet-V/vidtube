import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

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
  try {
    const { userId } = req.params;
    //if public then anyone can see, if private then only owner and sharedusers can see
    //Took time to write this query
    const playlists = await Playlist.aggregate([
      {
        $match: {
          //playlist = private then allow owner or shared users to view playlist
          $or: [
            {
              $and: [
                {
                  privacy: "Public",
                },
                {
                  owner: new mongoose.Types.ObjectId(userId),
                },
              ],
            },
            {
              $and: [
                {
                  privacy: "Private",
                },
                {
                  $or: [
                    {
                      $and: [
                        {
                          owner: new mongoose.Types.ObjectId(req.user._id),
                        },
                        {
                          owner: new mongoose.Types.ObjectId(userId),
                        },
                      ],
                    },
                    {
                      sharedUsers: {
                        $elemMatch: {
                          $eq: new mongoose.Types.ObjectId(req.user._id),
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ]);
    res
      .status(200)
      .json(new ApiResponse(200, playlists, "Playlists fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Error fetching playlists");
  }
});

const togglePlaylistPrivacy = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { privacy } = req.body;
    const loggedInUser = new mongoose.Types.ObjectId(req.user._id);
    if (!["Private", "Public"].includes(privacy)) {
      throw new ApiError(500, "Privacy of playlist can only be Public/Private");
    }
    const oldPlaylist = await Playlist.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(playlistId),
        owner: loggedInUser,
      },
      {
        privacy,
      }
    );
    if (!updatePlaylist) {
      throw new ApiError(404, "Playlist not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          privacy === oldPlaylist?.privacy
            ? "Playlist already " + privacy.toUpperCase()
            : "Playlist updated successfully to " + privacy.toUpperCase()
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error changing privacy of playlist");
  }
});

// add or remove users from urs playlist
const toogleUserFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(500, "User not found");
    }
    //complex query, took help from chat gpt
    const playlist = await Playlist.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(playlistId),
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
      [
        {
          $set: {
            sharedUsers: {
              $cond: {
                if: {
                  $in: [new mongoose.Types.ObjectId(userId), "$sharedUsers"],
                },
                then: {
                  $filter: {
                    input: "$sharedUsers",
                    as: "user",
                    cond: {
                      $ne: ["$$user", new mongoose.Types.ObjectId(userId)],
                    }, // Remove user if exists
                  },
                },
                else: {
                  $concatArrays: [
                    "$sharedUsers", // Keep the existing sharedUsers
                    [new mongoose.Types.ObjectId(userId)], // Add the new user if they don't exist
                  ],
                },
              },
            },
          },
        },
      ],
      { new: true }
    );

    res.status(200).json(new ApiResponse(200, playlist, "Shared user updated"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Error handling user from playlist");
  }
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
  togglePlaylistPrivacy,
  toogleUserFromPlaylist,
};
