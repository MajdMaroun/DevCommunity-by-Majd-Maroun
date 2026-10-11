import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description: string;
  logo?: string;
  topics: string[];
  members: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  cover?: string;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    logo: {
      type: String,
    },

    topics: {
      type: [String],
      default: [],
      index: true,
    },

    // Users who joined. toggleMembership adds/removes ids here.
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    cover: { type: String },
  },
  {
    timestamps: true,
  }
);

const Community: Model<ICommunity> =
  mongoose.models.Community ||
  mongoose.model<ICommunity>("Community", CommunitySchema);

export default Community;