import mongoose, { Schema, Model } from "mongoose";

export interface ILike {
  post: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One like per user per post, enforced by the database
LikeSchema.index({ post: 1, user: 1 }, { unique: true });

const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);

export default Like;