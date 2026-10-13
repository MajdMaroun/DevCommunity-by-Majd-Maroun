"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import Like from "@/lib/models/Like";
import Comment from "@/lib/models/Comment";
import { getCurrentUserId } from "@/lib/queries/auth";
import { notify, unnotify } from "@/lib/notifications";

function refreshPost() {
  revalidatePath("/blogs/[slug]", "page");
}

/* ---------- LIKE / UNLIKE ---------- */
export async function toggleLike(postId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Sign in to like posts." };
  if (!Types.ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post." };

  await connectToDatabase();

  const post = await Post.findById(postId).select("published author").lean();
  if (!post) return { ok: false as const, error: "Post not found." };
  if (!post.published && String(post.author) !== userId) {
    return { ok: false as const, error: "Post not found." };
  }

  // Try to remove an existing like first; if there was none, add one
  const removed = await Like.deleteOne({ post: postId, user: userId });
  let liked = false;

  if (removed.deletedCount === 0) {
    try {
      await Like.create({ post: postId, user: userId });
    } catch (error: unknown) {
      // Double click: the unique index already stopped the duplicate
      if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) {
        throw error;
      }
    }
    liked = true;
  }

  const count = await Like.countDocuments({ post: postId });

  // Tell the post's author, and take it back if the like is removed
  if (liked) {
    await notify({
      recipient: String(post.author),
      actor: userId,
      type: "like",
      post: postId,
      dedupe: true,
    });
  } else {
    await unnotify({ actor: userId, type: "like", post: postId });
  }

  refreshPost();
  return { ok: true as const, liked, count };
}

/* ---------- ADD COMMENT ---------- */
export async function addComment(postId: string, content: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Sign in to comment." };
  if (!Types.ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post." };

  const text = content.trim();
  if (!text) return { ok: false as const, error: "Write something first." };
  if (text.length > 1000) {
    return { ok: false as const, error: "Comments can be at most 1000 characters." };
  }

  await connectToDatabase();

  const post = await Post.findById(postId).select("published author").lean();
  if (!post || (!post.published && String(post.author) !== userId)) {
    return { ok: false as const, error: "Post not found." };
  }

  const comment = await Comment.create({ post: postId, author: userId, content: text });

  await notify({
    recipient: String(post.author),
    actor: userId,
    type: "comment",
    post: postId,
    comment: String(comment._id),
    text: text.slice(0, 80),
  });

  refreshPost();
  return { ok: true as const };
}

/* ---------- DELETE COMMENT ---------- */
// The comment's author, or the post's author, can delete it
export async function deleteComment(commentId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "You must be signed in." };
  if (!Types.ObjectId.isValid(commentId)) return { ok: false as const, error: "Invalid comment." };

  await connectToDatabase();

  const comment = await Comment.findById(commentId).select("author post").lean();
  if (!comment) return { ok: false as const, error: "Comment not found." };

  const isCommentAuthor = String(comment.author) === userId;
  let isPostAuthor = false;
  if (!isCommentAuthor) {
    const post = await Post.findById(comment.post).select("author").lean();
    isPostAuthor = !!post && String(post.author) === userId;
  }

  if (!isCommentAuthor && !isPostAuthor) {
    return { ok: false as const, error: "You cannot delete this comment." };
  }

  await Comment.deleteOne({ _id: commentId });
  await unnotify({ comment: commentId });

  refreshPost();
  return { ok: true as const };
}