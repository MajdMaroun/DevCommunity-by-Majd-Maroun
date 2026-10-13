"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addComment, deleteComment } from "@/app/actions/engagement";

export function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await addComment(postId, content);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setContent("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Write a comment..."
        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{content.length}/1000</span>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-400">{error}</span>}
          <button
            type="submit"
            disabled={pending || !content.trim()}
            className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50"
          >
            {pending ? "Posting..." : "Comment"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm("Delete this comment?")) return;
    startTransition(async () => {
      const res = await deleteComment(commentId);
      if (res.ok) router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-xs text-gray-500 transition hover:text-red-400 disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}