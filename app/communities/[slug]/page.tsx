import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  ImageOff,
  PenSquare,
  Users,
} from "lucide-react";

import JoinButton from "@/components/JoinButton";
import Reveal from "@/components/Reveal";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getCommunityBySlug } from "@/lib/queries/communities";
import { getPostsByCommunity } from "@/lib/queries/post";

const card = "rounded-2xl border border-slate-800 bg-[#0f1629]";
const tag =
  "rounded-md bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500/20 hover:text-blue-200 motion-reduce:transform-none";

function formatCount(count: number) {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(".0", "")}K`;
  }

  return String(count);
}

function AuthorAvatar({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className="h-7 w-7 shrink-0 rounded-full object-cover ring-2 ring-slate-800 transition-all duration-300 hover:scale-110 hover:ring-blue-400/50 motion-reduce:transform-none"
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
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white ring-2 ring-slate-800 transition-all duration-300 hover:scale-110 hover:ring-indigo-400/50 motion-reduce:transform-none">
      {initials || "U"}
    </span>
  );
}

function CommunityLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 text-white sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-5 h-5 w-36 animate-pulse rounded bg-slate-800" />

      <section className={`${card} overflow-hidden`}>
        <div className="h-28 animate-pulse bg-slate-900 sm:h-36" />

        <div className="space-y-4 px-5 py-6 sm:px-7">
          <div className="h-8 w-2/3 animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-slate-900" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded bg-slate-900" />
        </div>
      </section>

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="space-y-4">
          <div className="h-7 w-40 animate-pulse rounded bg-slate-800" />

          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`${card} h-36 animate-pulse`}
            />
          ))}
        </section>

        <aside className={`${card} hidden h-48 animate-pulse lg:block`} />
      </div>
    </main>
  );
}

async function CommunityContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const userId = await getCurrentUserId();
  const signedIn = !!userId;

  const community = await getCommunityBySlug(slug, userId);

  if (!community) {
    notFound();
  }

  const posts = await getPostsByCommunity(community.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 text-white sm:px-6 lg:px-8 lg:py-10">
      <Reveal>
        <Link
          href="/communities"
          className="group mb-5 inline-flex items-center gap-2 rounded-lg py-1 pr-2 text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1.5 motion-reduce:transform-none" />
          Back to communities
        </Link>
      </Reveal>

      <Reveal delay={60}>
        <section
          className={`${card} group/hero overflow-hidden transition-all duration-500 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-950/30`}
        >
          {/* Banner */}
          <div className="relative h-28 overflow-hidden border-b border-slate-800 bg-[radial-gradient(ellipse_at_75%_20%,rgba(59,130,246,0.32),transparent_60%),radial-gradient(ellipse_at_10%_90%,rgba(99,102,241,0.22),transparent_55%)] sm:h-36">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 animate-pulse rounded-full bg-blue-500/20 blur-3xl motion-reduce:animate-none" />
            <div className="pointer-events-none absolute -bottom-12 left-1/4 h-32 w-32 animate-pulse rounded-full bg-indigo-500/20 blur-3xl [animation-delay:1.5s] motion-reduce:animate-none" />
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:28px_28px]"
            />
          </div>

          <div className="px-5 pb-6 sm:px-7">
            {/* Only the logo overlaps the banner. Text sits fully below it. */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
                {community.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={community.logo}
                    alt={`${community.name} logo`}
                    referrerPolicy="no-referrer"
                    className="relative -mt-10 h-20 w-20 shrink-0 rounded-2xl border-4 border-[#0f1629] bg-slate-900 object-contain shadow-xl shadow-black/40 transition-transform duration-500 ease-out group-hover/hero:scale-105 group-hover/hero:-rotate-3 sm:-mt-14 sm:h-28 sm:w-28 motion-reduce:transform-none"
                  />
                ) : (
                  <div className="relative -mt-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-[#0f1629] bg-gradient-to-br from-blue-500/30 to-indigo-500/20 text-3xl font-bold text-blue-200 shadow-xl shadow-black/40 transition-transform duration-500 ease-out group-hover/hero:scale-105 group-hover/hero:-rotate-3 sm:-mt-14 sm:h-28 sm:w-28 sm:text-4xl motion-reduce:transform-none">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 sm:pt-4">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {community.name}
                  </h1>

                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                    <Users className="h-4 w-4 text-blue-400" />
                    {formatCount(community.memberCount)}{" "}
                    {community.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>

              <div className="w-full transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:mt-4 sm:w-40 sm:shrink-0 motion-reduce:transform-none">
                <JoinButton
                  communityId={community.id}
                  joined={community.joined}
                  signedIn={signedIn}
                />
              </div>
            </div>

            <p className="mt-6 max-w-3xl text-sm leading-7 text-slate-300">
              {community.description}
            </p>

            {community.topics.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {community.topics.map((topic) => (
                  <Link
                    key={topic}
                    href={`/blogs?topic=${encodeURIComponent(topic)}`}
                    className={tag}
                  >
                    #{topic}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </Reveal>

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <Reveal delay={100}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <div>
                <h2 className="text-xl font-bold text-white">Latest posts</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {posts.length} {posts.length === 1 ? "post" : "posts"}{" "}
                  published
                </p>
              </div>

              {signedIn && (
                <Link
                  href="/create"
                  className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-950/40 active:translate-y-0 active:scale-95 motion-reduce:transform-none"
                >
                  <PenSquare className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110 motion-reduce:transform-none" />
                  Create a post
                </Link>
              )}
            </div>
          </Reveal>

          {posts.length === 0 ? (
            <Reveal delay={140}>
              <div
                className={`${card} group flex flex-col items-center px-4 py-12 text-center transition-all duration-300 hover:border-blue-500/40 hover:bg-[#121b33] sm:px-6 sm:py-14`}
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-blue-500/25 motion-reduce:transform-none">
                  <FileText className="h-7 w-7" />
                </span>

                <h3 className="mt-4 text-base font-semibold text-white">
                  No posts yet
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Posts published in this community will appear here.
                </p>

                {signedIn && (
                  <Link
                    href="/create"
                    className="group/btn mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white active:translate-y-0 active:scale-95 motion-reduce:transform-none"
                  >
                    <PenSquare className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:-rotate-12 motion-reduce:transform-none" />
                    Write the first post
                  </Link>
                )}
              </div>
            </Reveal>
          ) : (
            <div className="space-y-3">
              {posts.map((post, i) => {
                const authorName = post.author?.name ?? "Unknown author";
                const href = `/blogs/${post.slug}`;
                const cover = post.cover?.trim();

                return (
                  <Reveal key={post._id} delay={Math.min(i, 8) * 60}>
                    <article
                      className={`${card} group flex flex-col gap-4 p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-blue-500/30 hover:bg-[#121b33] hover:shadow-xl hover:shadow-blue-950/30 sm:flex-row sm:p-5 motion-reduce:transform-none`}
                    >
                      <Link
                        href={href}
                        tabIndex={-1}
                        aria-hidden="true"
                        className="block shrink-0 overflow-hidden rounded-xl sm:w-48"
                      >
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            loading="lazy"
                            className="aspect-[16/9] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 sm:aspect-auto sm:h-full sm:min-h-[8rem] motion-reduce:transform-none"
                          />
                        ) : (
                          <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-800 to-slate-900 text-slate-600 transition-transform duration-500 ease-out group-hover:scale-110 sm:aspect-auto sm:h-full sm:min-h-[8rem] motion-reduce:transform-none">
                            <ImageOff className="h-7 w-7" aria-hidden="true" />
                            <span className="text-[10px] font-medium">
                              No cover image
                            </span>
                          </div>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        {post.topics?.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {post.topics.slice(0, 3).map((topic) => (
                              <Link
                                key={topic}
                                href={`/blogs?topic=${encodeURIComponent(
                                  topic
                                )}`}
                                className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 transition-all duration-200 hover:scale-105 hover:bg-blue-500/20 hover:text-blue-200 motion-reduce:transform-none"
                              >
                                #{topic}
                              </Link>
                            ))}
                          </div>
                        )}

                        <Link href={href} className="block">
                          <h3 className="line-clamp-2 break-words text-base font-semibold leading-snug text-white transition-colors duration-200 group-hover:text-blue-300 sm:text-lg">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="mt-1.5 line-clamp-2 break-words text-sm leading-6 text-slate-400 transition-colors duration-200 group-hover:text-slate-300">
                          {post.content}
                        </p>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4 text-xs text-slate-500">
                          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
                            {post.author && (
                              <div className="flex min-w-0 items-center gap-2">
                                <AuthorAvatar
                                  src={post.author.image}
                                  name={authorName}
                                />

                                {post.author.username ? (
                                  <Link
                                    href={`/profile/${post.author.username}`}
                                    className="max-w-[10rem] truncate font-medium text-slate-300 transition-colors duration-200 hover:text-white"
                                  >
                                    {authorName}
                                  </Link>
                                ) : (
                                  <span className="max-w-[10rem] truncate font-medium text-slate-300">
                                    {authorName}
                                  </span>
                                )}
                              </div>
                            )}

                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {new Date(post.createdAt).toLocaleDateString(
                                "en",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>

                          <Link
                            href={href}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-500/10 px-3 py-1.5 font-semibold text-blue-400 transition-all duration-200 hover:bg-blue-500/20 hover:text-blue-300 active:scale-95 motion-reduce:transform-none"
                          >
                            Read post
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Reveal delay={140}>
            <section
              className={`${card} p-5 transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-950/20`}
            >
              <h2 className="text-sm font-semibold text-white">
                About this community
              </h2>

              <p className="mt-3 text-xs leading-6 text-slate-400">
                {community.description}
              </p>

              <div className="mt-5 grid grid-cols-2 divide-x divide-slate-800 border-t border-slate-800 pt-4 text-center">
                <div className="group cursor-default transition-transform duration-200 hover:scale-110 motion-reduce:transform-none">
                  <p className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-300">
                    {formatCount(community.memberCount)}
                  </p>
                  <p className="text-[11px] text-slate-500">Members</p>
                </div>

                <div className="group cursor-default transition-transform duration-200 hover:scale-110 motion-reduce:transform-none">
                  <p className="text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-300">
                    {posts.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Posts</p>
                </div>
              </div>
            </section>
          </Reveal>

          {community.topics.length > 0 && (
            <Reveal delay={200}>
              <section
                className={`${card} p-5 transition-all duration-300 hover:border-slate-700 hover:shadow-lg hover:shadow-blue-950/20`}
              >
                <h2 className="text-sm font-semibold text-white">
                  Community topics
                </h2>

                <div className="mt-4 flex flex-wrap gap-2">
                  {community.topics.map((topic) => (
                    <Link
                      key={topic}
                      href={`/blogs?topic=${encodeURIComponent(topic)}`}
                      className={tag}
                    >
                      #{topic}
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          )}
        </aside>
      </div>
    </main>
  );
}

export default function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<CommunityLoading />}>
      <CommunityContent params={params} />
    </Suspense>
  );
}