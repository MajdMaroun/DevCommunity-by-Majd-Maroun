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

  await connectToDatabase();
  const user = new Types.ObjectId(userId);
  const id = new Types.ObjectId(communityId);

  const alreadyMember = await Community.exists({ _id: id, members: user });

  await Community.updateOne(
    { _id: id },
    alreadyMember ? { $pull: { members: user } } : { $addToSet: { members: user } }
  );

  revalidatePath("/");
  return { ok: true as const, joined: !alreadyMember };
}