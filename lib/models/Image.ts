import mongoose, { Schema, Model } from "mongoose";

export interface IImage {
  data: Buffer;
  contentType: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ImageModel: Model<IImage> =
  mongoose.models.Image || mongoose.model<IImage>("Image", ImageSchema);

export default ImageModel;