"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import Like from "@/lib/models/Like";
import Comment from "@/lib/models/Comment";
import CommentLike from "@/lib/models/CommentLike";
import { getCurrentUserId } from "@/lib/queries/auth";
import { notify, unnotify } from "@/lib/notifications";

function refreshPost() {
  revalidatePath("/blogs/[slug]", "page");
}

const isDuplicateKey = (error: unknown) =>
  !!error && typeof error === "object" && "code" in error && error.code === 11000;

/* ---------- LIKE / UNLIKE A POST ---------- */
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
      if (!isDuplicateKey(error)) throw error;
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

/* ---------- WHO LIKED THIS POST ---------- */
export async function getPostLikers(postId: string) {
  if (!Types.ObjectId.isValid(postId)) return { ok: false as const, error: "Invalid post." };

  await connectToDatabase();

  const viewerId = await getCurrentUserId();
  const post = await Post.findById(postId).select("published author").lean();
  if (!post || (!post.published && String(post.author) !== viewerId)) {
    return { ok: false as const, error: "Post not found." };
  }

  const [likes, total] = await Promise.all([
    Like.find({ post: postId })
      .sort({ createdAt: -1 })
      .limit(100)
      // names only, so the list stays small
      .populate({ path: "user", model: User, select: "name username" })
      .lean(),
    Like.countDocuments({ post: postId }),
  ]);

  const people = (
    likes as unknown as { user?: { _id: unknown; name?: string; username?: string } | null }[]
  )
    .filter((l) => !!l.user)
    .map((l) => ({
      id: String(l.user!._id),
      name: l.user!.name ?? "Unknown",
      username: l.user!.username ?? null,
    }));

  return { ok: true as const, total, people };
}

/* ---------- ADD COMMENT OR REPLY ---------- */
// parentId = the comment being replied to (leave empty for a normal comment)
export async function addComment(postId: string, content: string, parentId?: string) {
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

  // Threads are one level deep. Replying to a reply attaches to the same top-level
  // comment and remembers who it was addressed to.
  let parent: string | undefined;
  let replyTo: string | undefined;
  let replyRecipient: string | undefined; // whoever wrote the comment being answered

  if (parentId) {
    if (!Types.ObjectId.isValid(parentId)) {
      return { ok: false as const, error: "Invalid comment." };
    }

    const target = await Comment.findById(parentId).select("post parent author").lean();
    if (!target || String(target.post) !== postId) {
      return { ok: false as const, error: "Comment not found." };
    }

    replyRecipient = String(target.author);

    if (target.parent) {
      parent = String(target.parent);
      replyTo = String(target.author);
    } else {
      parent = String(target._id);
    }
  }

  const comment = await Comment.create({
    post: postId,
    author: userId,
    content: text,
    parent,
    replyTo,
  });

  const preview = text.slice(0, 80);

  // "X replied to your comment" goes to the person being answered
  if (replyRecipient) {
    await notify({
      recipient: replyRecipient,
      actor: userId,
      type: "reply",
      post: postId,
      comment: String(comment._id),
      text: preview,
    });
  }

  // The post's author hears about new comments, unless they just got the reply notification
  if (String(post.author) !== replyRecipient) {
    await notify({
      recipient: String(post.author),
      actor: userId,
      type: "comment",
      post: postId,
      comment: String(comment._id),
      text: preview,
    });
  }

  refreshPost();
  return { ok: true as const };
}

/* ---------- DELETE COMMENT ---------- */
// The comment's author, or the post's author, can delete it.
// Deleting a top-level comment also deletes its replies.
export async function deleteComment(commentId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "You must be signed in." };
  if (!Types.ObjectId.isValid(commentId)) return { ok: false as const, error: "Invalid comment." };

  await connectToDatabase();

  const comment = await Comment.findById(commentId).select("author post parent").lean();
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

  const ids: string[] = [commentId];
  if (!comment.parent) {
    const replyIds = await Comment.find({ parent: commentId }).distinct("_id");
    ids.push(...replyIds.map(String));
  }

  await Promise.all([
    CommentLike.deleteMany({ comment: { $in: ids } }),
    Comment.deleteMany({ _id: { $in: ids } }),
  ]);
  for (const id of ids) await unnotify({ comment: id });

  refreshPost();
  return { ok: true as const };
}

/* ---------- LIKE / UNLIKE A COMMENT ---------- */
export async function toggleCommentLike(commentId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false as const, error: "Sign in to like comments." };
  if (!Types.ObjectId.isValid(commentId)) return { ok: false as const, error: "Invalid comment." };

  await connectToDatabase();

  const comment = await Comment.findById(commentId).select("post author").lean();
  if (!comment) return { ok: false as const, error: "Comment not found." };

  const post = await Post.findById(comment.post).select("published author").lean();
  if (!post || (!post.published && String(post.author) !== userId)) {
    return { ok: false as const, error: "Comment not found." };
  }

  const removed = await CommentLike.deleteOne({ comment: commentId, user: userId });
  let liked = false;

  if (removed.deletedCount === 0) {
    try {
      await CommentLike.create({ comment: commentId, user: userId });
    } catch (error: unknown) {
      if (!isDuplicateKey(error)) throw error;
    }
    liked = true;
  }

  const count = await CommentLike.countDocuments({ comment: commentId });

  // Tell the comment's author, and take it back if the like is removed
  if (liked) {
    await notify({
      recipient: String(comment.author),
      actor: userId,
      type: "comment_like",
      post: String(comment.post),
      comment: commentId,
      dedupe: true,
    });
  } else {
    await unnotify({ actor: userId, type: "comment_like", comment: commentId });
  }

  refreshPost();
  return { ok: true as const, liked, count };
}