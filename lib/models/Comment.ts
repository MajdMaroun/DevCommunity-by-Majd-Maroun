import mongoose, { Schema, Model } from "mongoose";

export interface IComment {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parent?: mongoose.Types.ObjectId | null; // the top-level comment this is a reply to
  replyTo?: mongoose.Types.ObjectId | null; // who a reply is addressed to (replies to replies)
  createdAt: Date;
  updatedAt: Date;
}
if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Comment;
}

const CommentSchema = new Schema<IComment>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    parent: { type: Schema.Types.ObjectId, ref: "Comment", default: null, index: true },
    replyTo: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: -1 });

const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;