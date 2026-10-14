import mongoose, { Schema, Model } from "mongoose";

export type NotificationType =
  | "follow"
  | "like"
  | "comment"
  | "reply"
  | "comment_like"
  | "new_post";

export interface INotification {
  recipient: mongoose.Types.ObjectId; // who gets it
  actor: mongoose.Types.ObjectId; // who did it
  type: NotificationType;
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  text?: string; // short preview, used for comments
  readAt?: Date | null; // empty = unread
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["follow", "like", "comment", "reply", "comment_like", "new_post"],
      required: true,
    },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    comment: { type: Schema.Types.ObjectId, ref: "Comment" },
    text: { type: String, maxlength: 200 },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// The bell asks: "my unread notifications, newest first"
NotificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });
NotificationSchema.index({ post: 1 });

// History cleans itself up: MongoDB deletes notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;