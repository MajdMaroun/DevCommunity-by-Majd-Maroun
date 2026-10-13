"use server";

import "server-only";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/lib/models/Notification";
import { getCurrentUserId } from "@/lib/queries/auth";

// Clicking a notification marks it as read.
// It leaves the bell, but stays in "Recent" on the notifications page.
export async function dismissNotification(id: string) {
  const userId = await getCurrentUserId();
  if (!userId || !Types.ObjectId.isValid(id)) return { ok: false as const };

  await connectToDatabase();
  // recipient filter: you can only touch your own notifications
  await Notification.updateOne(
    { _id: id, recipient: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return { ok: true as const };
}

// "Clear all" in the bell, "Mark all as read" on the page
export async function clearAllNotifications() {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const };

  await connectToDatabase();
  await Notification.updateMany(
    { recipient: userId, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return { ok: true as const };
}

// The × on the page: remove one notification for good
export async function deleteNotification(id: string) {
  const userId = await getCurrentUserId();
  if (!userId || !Types.ObjectId.isValid(id)) return { ok: false as const };

  await connectToDatabase();
  await Notification.deleteOne({ _id: id, recipient: userId });

  return { ok: true as const };
}

// "Clear history" on the page: remove everything for good
export async function deleteAllNotifications() {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const };

  await connectToDatabase();
  await Notification.deleteMany({ recipient: userId });

  return { ok: true as const };
}