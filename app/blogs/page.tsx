import Link from "next/link";
import { ImageOff, X } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import { getPublishedPosts } from "@/lib/queries/post";

interface BlogPageSearchParams {
  topic?: string;
}

interface BlogAuthor {
  username?: string;
  name?: string;
}

interface BlogCommunity {
  slug: string;
  name: string;
}

interface BlogPost {
  _id: string;
  slug: string;
  cover?: string;
  title: string;
  content: string;
  topics: string[];
  author?: BlogAuthor;
  community?: BlogCommunity;
  createdAt: string | Date;
  editedAt?: string | Date;
}

export const dynamic = "force-dynamic";

/* same tokens as the home page */
const card = "rounded-xl border border-slate-800 bg-[#0f1629]";
const chip = "rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300";

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<BlogPageSearchParams>;
}) {
  const { topic } = await searchParams;
  const posts: BlogPost[] = await getPublishedPosts(topic);

  return (
    <main className="mx-auto min-w-0 max-w-7xl space-y-5 px-4 py-6 text-white sm:px-6 sm:py-10">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
            {topic ? `Posts about ${topic}` : "Latest Blogs"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {topic
              ? `Showing posts tagged #${topic}.`
              : "Discover the latest posts from the DevCommunity."}
          </p>
        </div>

        {topic && (
          <Link
            href="/blogs"
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            #{topic} <X className="h-3.5 w-3.5 text-slate-400" />
            <span className="sr-only">Clear filter</span>
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <p className={`${card} p-6 text-sm text-slate-400`}>
          {topic ? (
            <>
              No posts about {topic} yet.{" "}
              <Link href="/blogs" className="text-blue-400 hover:text-blue-300">
                See all posts
              </Link>
              .
            </>
          ) : (
            <>
              No posts yet. Be the first to{" "}
              <Link href="/create" className="text-blue-400 hover:text-blue-300">
                write one
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const href = `/blogs/${post.slug}`;
            const cover = post.cover?.trim();

            return (
              <article
                key={post._id}
                className={`${card} flex min-w-0 flex-col overflow-hidden transition hover:border-slate-700`}
              >
                {/* No onError here: this is a server component. */}
                <Link href={href} className="block" tabIndex={-1} aria-hidden>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt=""
                      className="block aspect-[2/1] w-full object-cover"
                    />
                  ) : (
                    // Posts without a cover show a "no image" icon instead of a blank box
                    <div className="flex aspect-[2/1] w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600">
                      <ImageOff className="h-8 w-8" aria-hidden="true" />
                      <span className="text-[11px] font-medium">No cover image</span>
                    </div>
                  )}
                </Link>

                <div className="flex flex-1 flex-col p-4">
                  {post.topics.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {post.topics.slice(0, 3).map((t) => (
                        <Link
                          key={t}
                          href={`/blogs?topic=${encodeURIComponent(t)}`}
                          className={`${chip} hover:bg-slate-700`}
                        >
                          #{t}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <Link href={href} className="min-w-0 flex-1">
                      <h2 className="line-clamp-2 break-words text-base font-semibold text-white hover:text-blue-300">
                        {post.title}
                      </h2>
                    </Link>
                    <BookmarkButton post={{ id: post._id, title: post.title, href }} />
                  </div>

                  <p className="mb-4 mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-400">
                    {post.content}
                  </p>

                  {/* Footer pinned to the bottom of the card */}
                  <div className="mt-auto space-y-1 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
                    <p className="truncate">
                      By{" "}
                      {post.author?.username ? (
                        <Link
                          href={`/profile/${post.author.username}`}
                          className="text-slate-300 hover:text-white"
                        >
                          {post.author.name}
                        </Link>
                      ) : (
                        <span className="text-slate-300">
                          {post.author?.name ?? "Unknown author"}
                        </span>
                      )}
                      {post.community && (
                        <>
                          {" in "}
                          <Link
                            href={`/communities/${post.community.slug}`}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {post.community.name}
                          </Link>
                        </>
                      )}
                    </p>
                    <p>
                      {new Date(post.createdAt).toLocaleDateString()}
                      {post.editedAt && (
                        <span title={new Date(post.editedAt).toLocaleString()}>
                          {" · "}Edited {new Date(post.editedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}