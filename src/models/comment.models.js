import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    parent: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentType: {
      type: String,
      enum: ["Video", "Comment", "Tweet"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
