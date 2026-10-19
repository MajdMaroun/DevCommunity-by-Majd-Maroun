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

// Prevent duplicate follow relationships and support queries
// that check whether a user follows another user.
FollowSchema.index(
{ follower: 1, following: 1 },
{ unique: true }
);

// Support queries that find everyone following a particular user.
FollowSchema.index({ following: 1 });

// Reuse the model during Next.js development hot reloads.
const Follow: Model<IFollow> =
mongoose.models.Follow ||
mongoose.model<IFollow>("Follow", FollowSchema);

export default Follow;
