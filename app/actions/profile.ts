"use server";

import "server-only";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getCurrentUserId } from "@/lib/queries/auth";

export type ProfileFormState = {
  ok: boolean;
  message: string;
};

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { ok: false, message: "You need to sign in." };
  }

  const name = String(formData.get("name") ?? "").trim();

  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();

  const title = String(formData.get("title") ?? "").trim();

  const bio = String(formData.get("bio") ?? "").trim();

  const image = String(formData.get("image") ?? "").trim();

  // Validate name
  if (name.length < 2 || name.length > 50) {
    return {
      ok: false,
      message: "Name must be 2 to 50 characters.",
    };
  }

  // Validate username
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      ok: false,
      message:
        "Username must be 3 to 20 characters: letters, numbers, underscores.",
    };
  }

  // Validate title
  if (title.length < 1 || title.length > 50) {
    return {
      ok: false,
      message: "Professional title must be 1 to 50 characters.",
    };
  }

  // Validate bio
  if (bio.length > 160) {
    return {
      ok: false,
      message: "Bio can be at most 160 characters.",
    };
  }

  // Accept:
  // - empty (remove)
  // - existing http(s) URL
  // - JPEG data URL produced by the upload form
  const isUrl = /^https?:\/\/.+/i.test(image);

  const isUpload =
    /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image);

  if (image && !isUrl && !isUpload) {
    return {
      ok: false,
      message: "Invalid image. Please upload a photo again.",
    };
  }

  if (isUpload && image.length > 150_000) {
    return {
      ok: false,
      message: "Image is too large. Try a smaller photo.",
    };
  }

  await connectToDatabase();

  const taken = await User.exists({
    username,
    _id: { $ne: userId },
  });

  if (taken) {
    return {
      ok: false,
      message: "That username is already taken.",
    };
  }

  try {
    await User.updateOne(
      { _id: userId },
      {
        $set: {
          name,
          username,
          title,
          bio,
          image: image || null,
        },
      }
    );
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return {
        ok: false,
        message: "That username is already taken.",
      };
    }

    return {
      ok: false,
      message: "Could not save changes. Try again.",
    };
  }

  revalidatePath("/");
  revalidatePath("/", "layout");
  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath(`/profile/${username}`);

  return {
    ok: true,
    message: "Profile updated.",
  };
}