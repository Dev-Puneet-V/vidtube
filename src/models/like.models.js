import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["Video", "Comment"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

likeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
