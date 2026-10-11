"use client";

import Link from "next/link";
import { useBookmarks } from "@/lib/models/Bookmark";

const BookmarksPage = () => {
  const { bookmarks, toggle } = useBookmarks();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-white">Bookmarks</h1>
      <p className="text-sm text-gray-400">
        Here are all the posts you've bookmarked for later reading.
      </p>

      <div className="flex flex-col gap-4">
        {bookmarks.length === 0 && (
          <p className="text-sm text-gray-500">No bookmarks yet.</p>
        )}
        {bookmarks.map((post) => (
          <div
            key={post.id}
            className="flex items-center justify-between rounded-lg border border-slate-700 p-4"
          >
            <Link href={post.href} className="text-white hover:underline">
              {post.title}
            </Link>
            <button
              type="button"
              onClick={() => toggle(post)}
              className="text-sm text-slate-400 hover:text-white"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookmarksPage;