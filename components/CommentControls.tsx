"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { addComment, deleteComment, toggleCommentLike } from "@/app/actions/engagement";

/* ---------- write a comment, or a reply when parentId is given ---------- */
export function CommentForm({
  postId,
  parentId,
  placeholder = "Write a comment...",
  submitLabel = "Comment",
  autoFocus = false,
  onDone,
}: {
  postId: string;
  parentId?: string;
  placeholder?: string;
  submitLabel?: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await addComment(postId, content, parentId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setContent("");
      onDone?.();
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={parentId ? 2 : 3}
        maxLength={1000}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{content.length}/1000</span>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="text-xs text-gray-400 transition hover:text-white"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={pending || !content.trim()}
            className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {pending ? "Posting..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ---------- like, reply and delete buttons under a comment ---------- */
export function CommentActions({
  postId,
  commentId,
  initialLiked,
  initialLikeCount,
  signedIn,
  canDelete,
  hasReplies,
}: {
  postId: string;
  commentId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  signedIn: boolean;
  canDelete: boolean;
  hasReplies: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialLikeCount);
  const [replying, setReplying] = useState(false);
  const [likePending, startLike] = useTransition();
  const [deletePending, startDelete] = useTransition();

  function onLike() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (likePending) return;

    const before = { liked, count };
    setLiked(!liked);
    setCount(count + (liked ? -1 : 1));

    startLike(async () => {
      const res = await toggleCommentLike(commentId);
      if (!res.ok) {
        setLiked(before.liked);
        setCount(before.count);
        return;
      }
      setLiked(res.liked);
      setCount(res.count);
    });
  }

  function onReply() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    setReplying((open) => !open);
  }

  function onDelete() {
    const message = hasReplies
      ? "Delete this comment and all its replies?"
      : "Delete this comment?";
    if (!window.confirm(message)) return;

    startDelete(async () => {
      const res = await deleteComment(commentId);
      if (res.ok) router.refresh();
    });
  }

  const action = "text-xs text-gray-500 transition hover:text-white disabled:opacity-50";

  return (
    <div className="mt-2">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onLike}
          disabled={likePending}
          aria-pressed={liked}
          title={signedIn ? (liked ? "Unlike" : "Like") : "Sign in to like"}
          className={`inline-flex items-center gap-1.5 text-xs transition disabled:opacity-50 ${
            liked ? "text-pink-400" : "text-gray-500 hover:text-white"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-pink-400" : ""}`} />
          {count > 0 ? count : "Like"}
        </button>

        <button type="button" onClick={onReply} className={action}>
          Reply
        </button>

        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deletePending}
            className="text-xs text-gray-500 transition hover:text-red-400 disabled:opacity-50"
          >
            {deletePending ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>

      {replying && (
        <div className="mt-3">
          <CommentForm
            postId={postId}
            parentId={commentId}
            placeholder="Write a reply..."
            submitLabel="Reply"
            autoFocus
            onDone={() => setReplying(false)}
          />
        </div>
      )}
    </div>
  );
}