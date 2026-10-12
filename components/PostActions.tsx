"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost, togglePublished } from "@/app/actions/posts";

export default function PostActions({
  postId,
  slug,
  published,
  redirectTo, // where to go after deleting (e.g. when deleting from the post page)
}: {
  postId: string;
  slug: string;
  published: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(published);
  const [error, setError] = useState("");

  function onTogglePublished() {
    setError("");
    startTransition(async () => {
      const res = await togglePublished(postId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setIsPublished(res.published);
      router.refresh();
    });
  }

  function onDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setError("");
    startTransition(async () => {
      const res = await deletePost(postId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    });
  }

  const btn =
    "rounded-md border border-gray-700 px-3 py-1 text-xs font-medium text-gray-300 transition hover:bg-gray-800 disabled:opacity-50";

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {!isPublished && (
        <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300">
          Draft
        </span>
      )}

      <Link href={`/blogs/${slug}/edit`} className={btn}>
        Edit
      </Link>

      <button type="button" onClick={onTogglePublished} disabled={isPending} className={btn}>
        {isPublished ? "Move to drafts" : "Publish"}
      </button>

      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className={`${btn} hover:border-red-500/50 hover:text-red-300`}
      >
        Delete
      </button>

      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}