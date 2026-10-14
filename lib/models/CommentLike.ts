import mongoose, { Schema, Model } from "mongoose";

export interface ICommentLike {
  comment: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CommentLikeSchema = new Schema<ICommentLike>(
  {
    comment: { type: Schema.Types.ObjectId, ref: "Comment", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// One like per user per comment, enforced by the database
CommentLikeSchema.index({ comment: 1, user: 1 }, { unique: true });

const CommentLike: Model<ICommentLike> =
  mongoose.models.CommentLike ||
  mongoose.model<ICommentLike>("CommentLike", CommentLikeSchema);

export default CommentLike;