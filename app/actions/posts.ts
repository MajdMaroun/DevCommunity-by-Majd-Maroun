"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Community from "@/lib/models/Community";
import { getCurrentUserId } from "@/lib/queries/auth";

export type EditPostState = { error?: string } | null;

// Everything that lists or shows posts
function refreshPages() {
  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/blogs/[slug]", "page");
  revalidatePath("/profile");
  revalidatePath("/profile/[username]", "page");
  revalidatePath("/communities/[slug]", "page");
}

function parseTopics(raw: string) {
  const seen = new Set<string>();
  const topics: string[] = [];
  for (const t of raw.split(",")) {
    const topic = t.trim();
    const key = topic.toLowerCase();
    if (topic && !seen.has(key)) {
      seen.add(key);
      topics.push(topic);
    }
  }
  return topics.slice(0, 5);
}

/* ---------- EDIT ---------- */
// Used with useActionState: updatePostAction.bind(null, postId)
export async function updatePostAction(
  postId: string,
  _prev: EditPostState,
  formData: FormData
): Promise<EditPostState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "You must be signed in." };
  if (!Types.ObjectId.isValid(postId)) return { error: "Invalid post." };

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const cover = String(formData.get("cover") ?? "").trim();
  const community = String(formData.get("community") ?? "");
  const topics = parseTopics(String(formData.get("topics") ?? ""));
  const published = formData.get("published") === "on";

  if (!title || title.length > 200) return { error: "Title is required (max 200 characters)." };
  if (!content) return { error: "Content is required." };
  if (cover && !/^(https?:\/\/|\/api\/images\/[a-f0-9]{24}$)/i.test(cover)) return { error: "Cover must be an image URL or an uploaded image." };
  if (!Types.ObjectId.isValid(community)) return { error: "Please choose a community." };

  await connectToDatabase();

  if (!(await Community.exists({ _id: community }))) {
    return { error: "That community does not exist." };
  }

  // The author filter is the permission check: you can only edit your own posts
  const updated = await Post.findOneAndUpdate(
    { _id: postId, author: userId },
    { $set: { title, content, cover: cover || undefined, community, topics, published } },
    { new: true }
  );

  if (!updated) return { error: "Post not found, or you are not its author." };

  refreshPages();
  redirect(`/blogs/${updated.slug}`); // slug stays the same, so old links keep working
}

/* ---------- DELETE ---------- */
export async function deletePost(postId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "You must be signed in." };
  if (!Types.ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post." };

  await connectToDatabase();

  const res = await Post.deleteOne({ _id: postId, author: userId });
  if (res.deletedCount === 0) {
    return { ok: false as const, error: "Post not found, or you are not its author." };
  }

  refreshPages();
  return { ok: true as const };
}

/* ---------- PUBLISH / MOVE TO DRAFT ---------- */
export async function togglePublished(postId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "You must be signed in." };
  if (!Types.ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post." };

  await connectToDatabase();

  // Flips the flag in one atomic update
  const post = await Post.findOneAndUpdate(
    { _id: postId, author: userId },
    [{ $set: { published: { $not: "$published" } } }],
    { new: true, updatePipeline: true } // Mongoose requires this for pipeline updates
  );

  if (!post) return { ok: false as const, error: "Post not found, or you are not its author." };

  refreshPages();
  return { ok: true as const, published: !!post.published };
}