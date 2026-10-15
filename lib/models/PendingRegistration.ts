import mongoose, { Schema, Model, Types } from "mongoose";

export interface IPendingRegistration {
name: string;
username: string;
email: string;
password: string;
title?: string;
expiresAt: Date;
}

const PendingRegistrationSchema = new Schema<IPendingRegistration>(
{
name: { type: String, required: true, trim: true },
username: { type: String, required: true, lowercase: true, trim: true },
email: { type: String, required: true, lowercase: true, trim: true },
password: { type: String, required: true, select: false },
title: { type: String, default: "Developer", trim: true, maxlength: 50 },
expiresAt: { type: Date, required: true },
},
{ timestamps: true }
);

PendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PendingRegistrationSchema.index({ email: 1 }, { unique: true });
PendingRegistrationSchema.index({ username: 1 }, { unique: true });

const PendingRegistration: Model<IPendingRegistration> =
mongoose.models.PendingRegistration ||
mongoose.model<IPendingRegistration>(
"PendingRegistration",
PendingRegistrationSchema
);

export default PendingRegistration;
