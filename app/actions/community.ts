"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Community from "@/lib/models/Community";
import { getCurrentUserId } from "@/lib/queries/auth";

export async function toggleMembership(communityId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "unauthenticated" };

  if (!Types.ObjectId.isValid(communityId) || !Types.ObjectId.isValid(userId)) {
    return { ok: false as const, error: "invalid_id" };
  }

  await connectToDatabase();
  const user = new Types.ObjectId(userId);
  const id = new Types.ObjectId(communityId);

  // Try to leave first. This only matches if the user is currently a member,
  // so the check and the write happen in one atomic step.
  const left = await Community.updateOne(
    { _id: id, members: user },
    { $pull: { members: user } }
  );

  let joined = false;
  if (left.modifiedCount === 0) {
    // Not a member yet, so join
    await Community.updateOne({ _id: id }, { $addToSet: { members: user } });
    joined = true;
  }

  // Everything that shows membership or member counts
  revalidatePath("/");
  revalidatePath("/communities");
  revalidatePath("/communities/[slug]", "page");

  return { ok: true as const, joined };
}