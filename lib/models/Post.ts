import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  cover?: string;
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  topics: string[];
  published: boolean;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
      index: true,
    },

    topics: {
      type: [String],
      default: [],
      index: true,
    },

    published: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

PostSchema.index({ community: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;