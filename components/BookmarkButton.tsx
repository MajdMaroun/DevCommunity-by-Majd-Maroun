"use client";

import { Bookmark } from "lucide-react";
import { useBookmarks, type BookmarkedPost } from "@/lib/models/Bookmark";

export default function BookmarkButton({ post }: { post: BookmarkedPost }) {
  const { isBookmarked, toggle } = useBookmarks();
  const active = isBookmarked(post.id);

  return (
    <button
      type="button"
      aria-label={active ? "Remove bookmark" : "Bookmark"}
      aria-pressed={active}
      onClick={() => toggle(post)}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
        active
          ? "text-blue-400"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Bookmark
        className={`h-5 w-5 ${active ? "fill-current" : ""}`}
      />
    </button>
  );
}
