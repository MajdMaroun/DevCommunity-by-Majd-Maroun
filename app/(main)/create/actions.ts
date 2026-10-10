"use server";

import "server-only";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
  const published = formData.get("published") === "on";
  const topics = String(formData.get("topics") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  if (!title) return { error: "Title is required." };
  if (title.length > 200) return { error: "Title must be 200 characters or less." };
  if (!community) return { error: "Please choose a community." };
  if (!content) return { error: "Content is required." };

  await createPost({
    title,
    content,
    community,
    author: user._id,
    topics,
    published,
  });

  revalidatePath("/");
  revalidatePath("/profile");
  redirect("/profile");
}