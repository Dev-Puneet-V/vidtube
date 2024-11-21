import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    sharedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privacy: {
      type: String,
      enum: ["Private", "Public"],
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
