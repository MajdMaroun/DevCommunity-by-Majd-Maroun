import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMembership extends Document {
  user: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
}

const MembershipSchema = new Schema<IMembership>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    community: {
      type: Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

MembershipSchema.index(
  { user: 1, community: 1 },
  { unique: true }
);

MembershipSchema.index({ community: 1 });
MembershipSchema.index({ user: 1 });

const Membership: Model<IMembership> =
  mongoose.models.Membership ||
  mongoose.model<IMembership>("Membership", MembershipSchema);

export default Membership;