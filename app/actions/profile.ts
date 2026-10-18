"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getCurrentUserId } from "@/lib/queries/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type ProfileFormState = {
  ok: boolean;
  message: string;
};

const MAX_IMAGE_LENGTH = 150_000;

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

  if (name.length < 2 || name.length > 50) {
    return {
      ok: false,
      message: "Name must be 2 to 50 characters.",
    };
  }

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      ok: false,
      message:
        "Username must be 3 to 20 characters: letters, numbers, underscores.",
    };
  }

  if (title.length > 50) {
    return {
      ok: false,
      message: "Professional title must be at most 50 characters.",
    };
  }

  if (bio.length > 160) {
    return {
      ok: false,
      message: "Bio can be at most 160 characters.",
    };
  }

  const isUrl = /^https?:\/\/.+/i.test(image);
  const uploadMatch = image.match(
    /^data:image\/jpeg;base64,([A-Za-z0-9+/]+={0,2})$/
  );

  const isUpload = Boolean(uploadMatch);

  if (image && !isUrl && !isUpload) {
    return {
      ok: false,
      message: "Invalid image. Please upload a photo again.",
    };
  }

  if (isUpload && image.length > MAX_IMAGE_LENGTH) {
    return {
      ok: false,
      message: "Image is too large. Try a smaller photo.",
    };
  }

  let uploadedPath: string | null = null;

  try {
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

    // Keep existing Google/GitHub URLs unchanged.
    // New uploads are stored in Supabase, not MongoDB.
    let imageToSave: string | null = image || null;

    if (uploadMatch) {
      const imageBuffer = Buffer.from(uploadMatch[1], "base64");

      if (imageBuffer.length > 100_000) {
        return {
          ok: false,
          message: "Image is too large. Try a smaller photo.",
        };
      }

      uploadedPath = `${userId}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("Avatars")
        .upload(uploadedPath, imageBuffer, {
          contentType: "image/jpeg",
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) {
        uploadedPath = null;

        console.error("Avatar upload failed:", uploadError.message);

        return {
          ok: false,
          message: "Could not upload your photo. Please try again.",
        };
      }

      imageToSave = supabaseAdmin.storage
        .from("avatars")
        .getPublicUrl(uploadedPath).data.publicUrl;
    }

    const result = await User.updateOne(
      { _id: userId },
      {
        $set: {
          name,
          username,
          title,
          bio,
          image: imageToSave,
        },
      }
    );

    if (result.matchedCount === 0) {
      if (uploadedPath) {
        await supabaseAdmin.storage
          .from("avatars")
          .remove([uploadedPath]);
      }

      return {
        ok: false,
        message: "User not found.",
      };
    }
  } catch (err: unknown) {
    // Clean up a newly uploaded image if saving the profile fails.
    if (uploadedPath) {
      try {
        await supabaseAdmin.storage
          .from("avatars")
          .remove([uploadedPath]);
      } catch {
        // Preserve the original error.
      }
    }

    if ((err as { code?: number }).code === 11000) {
      return {
        ok: false,
        message: "That username is already taken.",
      };
    }

    console.error("Profile update failed:", err);

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