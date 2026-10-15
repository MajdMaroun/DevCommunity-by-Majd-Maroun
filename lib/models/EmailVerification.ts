import mongoose, { Schema, Model } from "mongoose";

export interface IEmailVerification {
  email: string;
  codeHash: string; // the 6-digit code is never stored, only a keyed hash of it
  attempts: number; // wrong guesses so far
  expiresAt: Date;
  lastSentAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>({
  email: { type: String, required: true, lowercase: true, trim: true, unique: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  lastSentAt: { type: Date, required: true },
});

// MongoDB deletes each record automatically once expiresAt has passed
EmailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification: Model<IEmailVerification> =
  mongoose.models.EmailVerification ||
  mongoose.model<IEmailVerification>("EmailVerification", EmailVerificationSchema);

export default EmailVerification;