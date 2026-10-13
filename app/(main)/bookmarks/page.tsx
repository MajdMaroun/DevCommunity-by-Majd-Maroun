"use client";

import Link from "next/link";
import { useBookmarks } from "@/lib/models/Bookmark";

const BookmarksPage = () => {
  const { bookmarks, toggle } = useBookmarks();

  return (
    <div className="flex flex-col gap-6 text-white">
      {/* Page Header */}
      <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-[#152341] to-[#0f172a] p-6 sm:p-8">
        <div className="mb-3 flex items-center gap-2">
          <svg
            className="h-5 w-5 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 5.5A2.5 2.5 0 017.5 3h9A2.5 2.5 0 0119 5.5V21l-7-4-7 4V5.5z"
            />
          </svg>

          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            SAVE • ORGANIZE • READ
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your Bookmarks
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Keep your favorite developer posts in one place. Save interesting
          ideas, revisit useful tutorials, and continue learning whenever
          you want.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Explore Blogs
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-7-7 7 7-7 7"
              />
            </svg>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
            <svg
              className="h-4 w-4 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5.5A2.5 2.5 0 017.5 3h9A2.5 2.5 0 0119 5.5V21l-7-4-7 4V5.5z"
              />
            </svg>

            <span>
              <span className="font-semibold text-white">
                {bookmarks.length}
              </span>{" "}
              saved {bookmarks.length === 1 ? "post" : "posts"}
            </span>
          </div>
        </div>
      </div>

      {/* Bookmarks Section */}
      <section>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
              Saved Posts
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Posts you want to read again.
            </p>
          </div>

          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-300">
            {bookmarks.length}{" "}
            {bookmarks.length === 1 ? "bookmark" : "bookmarks"}
          </span>
        </div>

        {/* Empty State */}
        {bookmarks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 5.5A2.5 2.5 0 017.5 3h9A2.5 2.5 0 0119 5.5V21l-7-4-7 4V5.5z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-white">
              No bookmarks yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Found an interesting tutorial or developer article? Bookmark
              it to keep it here for later.
            </p>

            <Link
              href="/blogs"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Discover Posts
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m-7-7 7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}

        {/* Bookmark Cards */}
        {bookmarks.length > 0 && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {bookmarks.map((post) => (
              <article
                key={post.id}
                className="group flex min-w-0 flex-col justify-between rounded-xl border border-slate-800 bg-[#0f172a] p-5 transition duration-200 hover:border-blue-500/50 hover:bg-[#111c32]"
              >
                <div className="flex items-start gap-4">
                  {/* Bookmark Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5.5A2.5 2.5 0 017.5 3h9A2.5 2.5 0 0119 5.5V21l-7-4-7 4V5.5z"
                      />
                    </svg>
                  </div>

                  {/* Post Information */}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={post.href}
                      className="break-words text-base font-semibold leading-6 text-white transition group-hover:text-blue-400"
                    >
                      {post.title}
                    </Link>

                    <p className="mt-2 text-sm leading-5 text-slate-400">
                      Saved for later reading
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-800 pt-4">
                  <Link
                    href={post.href}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                  >
                    Read Post
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14m-7-7 7 7-7 7"
                      />
                    </svg>
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggle(post)}
                    aria-label={`Remove ${post.title} from bookmarks`}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 7h12m-10 0 .7 13h6.6L16 7M9 7V4h6v3m-5 4v5m4-5v5"
                      />
                    </svg>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default BookmarksPage;