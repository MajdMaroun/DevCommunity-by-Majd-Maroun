import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Code2,
  Users,
} from "lucide-react";
import PostActions from "@/components/PostActions";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import BookmarkButton from "@/components/BookmarkButton";
import { getLikeState } from "@/lib/queries/engagement";
import { getPostBySlug } from "@/lib/queries/post";
import { getCurrentUser } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

function Avatar({
  src,
  name,
  className,
  textClassName = "text-xs",
}: {
  src?: string | null;
  name: string;
  className: string;
  textClassName?: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        className={`${className} shrink-0 rounded-full object-cover ring-2 ring-slate-950`}
      />
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`${className} ${textClassName} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 font-bold text-white ring-2 ring-slate-950`}
      aria-hidden="true"
    >
      {initials || "U"}
    </span>
  );
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const me = await getCurrentUser();
  const isAuthor = !!me && me._id === post.author?._id;

  // Drafts are only visible to their author.
  if (!post.published && !isAuthor) notFound();

  const author = post.author;
  const authorName = author?.name ?? "Unknown author";
  const like = await getLikeState(post._id, me?._id ?? null);

  const wordCount = post.content.trim().split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <main className="mx-auto w-full max-w-7xl text-white sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/blogs"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blogs
      </Link>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px] xl:gap-7">
        <div className="min-w-0">
          <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1629] shadow-2xl shadow-black/20">
            {post.cover && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
              {!post.cover && post.community && (
                <Link
                  href={`/communities/${post.community.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  {post.community.name}
                </Link>
              )}

              {!post.published && (
                <span className="mb-4 inline-flex rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-300">
                  Draft
                </span>
              )}

              <div className="flex items-start justify-between gap-4">
  <h1
    className={`min-w-0 flex-1 break-words text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl ${
      !post.cover && post.community ? "mt-5" : ""
    }`}
  >
    {post.title}
  </h1>

  <div className="shrink-0">
    <BookmarkButton
      post={{
        id: post._id,
        title: post.title,
        href: `/blogs/${post.slug}`,
      }}
    />
  </div>
</div>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-slate-800 pb-7">
                {author?.username ? (
                  <Link
                    href={`/profile/${author.username}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar
                      src={author.image}
                      name={authorName}
                      className="h-11 w-11"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-white transition hover:text-blue-300">
                        {authorName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        View profile
                      </span>
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={author?.image}
                      name={authorName}
                      className="h-11 w-11"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-white">
                        {authorName}
                      </span>
                      <span className="block text-xs text-slate-500">
                        Community author
                      </span>
                    </span>
                  </div>
                )}

                <span className="hidden h-8 w-px bg-slate-800 sm:block" />

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(post.createdAt)}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" />
                    {readMinutes} min read
                  </span>

                  {"editedAt" in post &&
                    typeof post.editedAt === "string" && (
                      <span
                        title={new Date(post.editedAt).toLocaleString()}
                        className="text-slate-500"
                      >
                        Edited {formatDate(post.editedAt)}
                      </span>
                    )}
                </div>
              </div>

              {isAuthor && (
                <div className="mt-6 rounded-xl border border-slate-800 bg-[#0a1020] p-4">
                  <p className="mb-3 text-xs font-medium text-slate-400">
                    Author controls
                  </p>

                  <PostActions
                    postId={post._id}
                    slug={post.slug}
                    published={post.published}
                    redirectTo="/profile"
                  />
                </div>
              )}

              {post.topics?.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.topics.map((topic) => (
                    <Link
                      key={topic}
                      href={`/blogs?topic=${encodeURIComponent(topic)}`}
                      className="rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
                    >
                      #{topic}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mx-auto mt-8 max-w-3xl whitespace-pre-wrap text-[15px] leading-8 text-slate-300 sm:text-base">
                {post.content}
              </div>

              {post.published && (
                <div className="mx-auto max-w-3xl pt-6">
                  <LikeButton
                    postId={post._id}
                    initialLiked={like.liked}
                    initialCount={like.count}
                    signedIn={!!me}
                  />
                </div>
              )}
            </div>
          </article>

          {post.published && (
            <section className="mt-5 rounded-2xl border border-slate-800 bg-[#0f1629] p-5 sm:p-7">
              <CommentSection
                postId={post._id}
                currentUserId={me?._id ?? null}
                postAuthorId={post.author?._id ?? null}
              />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-xl border border-slate-800 bg-[#0f1629] p-5">
            <div className="flex items-center gap-3">
              <Avatar
                src={author?.image}
                name={authorName}
                className="h-14 w-14"
                textClassName="text-base"
              />

              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white">
                  {authorName}
                </h2>
                <p className="text-xs text-slate-400">Post author</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-6 text-slate-300">
              Read more posts and discussions from {authorName}.
            </p>

            {author?.username && (
              <Link
                href={`/profile/${author.username}`}
                className="mt-5 block rounded-lg border border-slate-700 py-2.5 text-center text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                View profile
              </Link>
            )}
          </section>

          {post.community && (
            <section className="rounded-xl border border-slate-800 bg-[#0f1629] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                  <Code2 className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                    Published in
                  </p>
                  <h2 className="mt-0.5 truncate text-sm font-semibold text-white">
                    {post.community.name}
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Explore more posts and discussions from this community.
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  Community
                </span>

                <Link
                  href={`/communities/${post.community.slug}`}
                  className="text-xs font-semibold text-blue-400 transition hover:text-blue-300"
                >
                  View community
                </Link>
              </div>
            </section>
          )}

          {post.topics?.length > 0 && (
            <section className="rounded-xl border border-slate-800 bg-[#0f1629] p-5">
              <h2 className="text-sm font-semibold text-white">
                Explore topics
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {post.topics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/blogs?topic=${encodeURIComponent(topic)}`}
                    className="rounded-md bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    #{topic}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}