"use server";

import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Follow from "@/lib/models/Follow";
import { revalidatePath } from "next/cache";

// Profile pages show follower counts and the follow button state
function refreshPages() {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/profile/[username]", "page");
}

export async function toggleFollow(targetUserId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    return {
      success: false,
      error: "You must be logged in.",
    };
  }

  if (currentUserId === targetUserId) {
    return {
      success: false,
      error: "You cannot follow yourself.",
    };
  }

  await connectToDatabase();

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) {
    return {
      success: false,
      error: "User not found.",
    };
  }

  const existingFollow = await Follow.findOne({
    follower: currentUserId,
    following: targetUserId,
  });

  // UNFOLLOW
  if (existingFollow) {
    await Follow.deleteOne({
      _id: existingFollow._id,
    });

    await User.findByIdAndUpdate(currentUserId, {
      $inc: { following: -1 },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $inc: { followers: -1 },
    });

    refreshPages();

    return {
      success: true,
      following: false,
    };
  }

  // FOLLOW
  try {
    await Follow.create({
      follower: currentUserId,
      following: targetUserId,
    });
  } catch (error: unknown) {
    // Duplicate follow
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return {
        success: true,
        following: true,
      };
    }

    throw error;
  }

  await User.findByIdAndUpdate(currentUserId, {
    $inc: { following: 1 },
  });

  await User.findByIdAndUpdate(targetUserId, {
    $inc: { followers: 1 },
  });

  refreshPages();

  return {
    success: true,
    following: true,
  };
}