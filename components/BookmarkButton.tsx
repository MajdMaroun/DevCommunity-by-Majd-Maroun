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
      className={`hidden p-2 sm:block ${
        active ? "text-blue-400" : "text-slate-400 hover:text-white"
      }`}
    >
      <Bookmark className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}