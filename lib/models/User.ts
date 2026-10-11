import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  image?: string;
  bio: string;
  followers: number;
  following: number;
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    privateAccount: boolean;
    showActivityStatus: boolean;
    theme: "system" | "dark" | "light";
    language: "en" | "ar" | "fr" | "es";
  };
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    image: { type: String },
    bio: { type: String, default: "" },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    settings: {
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: false },
  weeklyDigest: { type: Boolean, default: true },
  privateAccount: { type: Boolean, default: false },
  showActivityStatus: { type: Boolean, default: true },
  theme: { type: String, enum: ["system", "dark", "light"], default: "system" },
  language: { type: String, enum: ["en", "ar", "fr", "es"], default: "en" },
},
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;