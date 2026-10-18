import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFollow extends Document {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate relationships and support queries by follower.
FollowSchema.index(
  { follower: 1, following: 1 },
  { unique: true }
);

// Supports follower counts and finding everyone who follows a user.
FollowSchema.index({ following: 1 });

// Reuse the model during Next.js development hot reloads.
const Follow: Model<IFollow> =
  mongoose.models.Follow ||
  mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;