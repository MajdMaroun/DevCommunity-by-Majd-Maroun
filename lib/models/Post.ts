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
  editedAt?: Date;
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
      unique: true, // Also creates an index for looking up posts by slug.
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

    cover: {
      type: String,
    },

    editedAt: {
      type: Date,
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

// Speeds up fetching recent posts within a specific community.
PostSchema.index({ community: 1, createdAt: -1 });

// Speeds up fetching an author's recent posts.
PostSchema.index({ author: 1, createdAt: -1 });

// Helps queries that filter published posts and sort them by creation date.
PostSchema.index({ published: 1, createdAt: -1 });

// Reuse the registered model during development hot reloads.
const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;