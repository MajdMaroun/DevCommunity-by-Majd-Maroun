"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Trash2 } from "lucide-react";
import { useBookmarks } from "@/lib/models/Bookmark";

const card = "rounded-xl border border-slate-800 bg-[#0f1629]";

const BookmarksPage = () => {
  const { bookmarks, toggle } = useBookmarks();
  const label = bookmarks.length === 1 ? "post" : "posts";

  return (
    <div className="min-w-0 space-y-5 text-white">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Your bookmarks
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Posts you saved to read again.{" "}
            <span className="whitespace-nowrap text-slate-300">
              {bookmarks.length} saved {label}
            </span>
          </p>
        </div>
        <Link
          href="/blogs"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 sm:w-auto"
        >
          Explore Blogs <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <div
          className={`${card} flex flex-col items-center justify-center border-dashed px-4 py-12 text-center sm:px-6 sm:py-14`}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/15">
            <Bookmark className="h-6 w-6 text-blue-300" />
          </div>
          <h3 className="text-base font-semibold text-white">No bookmarks yet</h3>
          <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-400">
            Use the bookmark button on any blog post to save it here.
          </p>
          <Link
            href="/blogs"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Discover Posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className={`${card} divide-y divide-slate-800`}>
          {bookmarks.map((post) => (
            <article key={post.id} className="flex items-center gap-3 p-3 sm:gap-4">
              <Link
                href={post.href}
                aria-hidden
                tabIndex={-1}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-slate-800 to-slate-900 sm:h-[62px] sm:w-[62px]"
              >
                <Bookmark className="h-5 w-5 text-blue-400" />
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={post.href}>
                  <h3 className="line-clamp-2 break-words text-sm font-semibold text-white hover:text-blue-300">
                    {post.title}
                  </h3>
                </Link>
                <p className="mt-0.5 text-xs text-slate-400">Saved for later</p>
              </div>

              <button
                type="button"
                onClick={() => toggle(post)}
                aria-label={`Remove ${post.title} from bookmarks`}
                className="shrink-0 rounded-lg border border-slate-700 p-2.5 text-slate-400 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 sm:p-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <Link
                href={post.href}
                className="hidden shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 sm:block"
              >
                Read Blog
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;