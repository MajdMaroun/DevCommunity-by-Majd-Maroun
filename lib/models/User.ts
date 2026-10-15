import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
name: string;
username: string;
title: string;
email: string;
emailVerified?: Date | null;
verificationCode?: string;
verificationCodeExpires?: Date | null;
password: string;
image?: string;
bio: string;
followers: number;
following: number;
}

const UserSchema = new Schema<IUser>(
{
name: {
type: String,
required: true,
trim: true,
},

username: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
},

title: {
  type: String,
  default: "Developer",
  trim: true,
  maxlength: 50,
},

email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
},

emailVerified: {
  type: Date,
  default: null,
},

verificationCode: {
  type: String,
  default: undefined,
  select: false,
},

verificationCodeExpires: {
  type: Date,
  default: null,
  select: false,
},

password: {
  type: String,
  required: true,
  select: false,
},

image: {
  type: String,
},

bio: {
  type: String,
  default: "",
},

followers: {
  type: Number,
  default: 0,
},

following: {
  type: Number,
  default: 0,
},

},
{
timestamps: true,
}
);

const User: Model<IUser> =
mongoose.models.User ||
mongoose.model<IUser>("User", UserSchema);

export default User;
