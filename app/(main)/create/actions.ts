"use server";

import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { getCurrentUser } from "@/lib/queries/users";
import { createPost } from "@/lib/queries/post";

export type CreatePostState = { error?: string } | null;

export async function createPostAction(
  _prev: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const user = await getCurrentUser();
  if (!user) return { error: "You must be logged in." };

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const community = String(formData.get("community") ?? "");
  const cover = String(formData.get("cover") ?? "").trim();

  const published = formData.get("published") === "on";

  // lowercase + de-duplicated, max 5
  const topics = [
    ...new Set(
      String(formData.get("topics") ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    ),
  ].slice(0, 5);

  if (!title) return { error: "Title is required." };

  if (title.length > 200) {
    return { error: "Title must be 200 characters or less." };
  }

  if (!community || !Types.ObjectId.isValid(community)) {
    return { error: "Please choose a community." };
  }

  if (!content) {
    return { error: "Content is required." };
  }

  // A pasted image URL, or an image uploaded from the device (/api/images/<id>)
  if (cover && !/^(https?:\/\/|\/api\/images\/[a-f0-9]{24}$)/i.test(cover)) {
    return { error: "Cover must be an image URL or an uploaded image." };
  }

  await createPost({
    title,
    content,
    cover: cover || undefined,
    community,
    author: user._id,
    topics,
    published,
  });

  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/profile");
  revalidatePath("/communities/[slug]", "page");

  redirect("/profile");
}