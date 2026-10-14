import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  PenSquare,
  Users,
} from "lucide-react";
import JoinButton from "@/components/JoinButton";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getCommunityBySlug } from "@/lib/queries/communities";
import { getPostsByCommunity } from "@/lib/queries/post";

export const dynamic = "force-dynamic";

const card = "rounded-xl border border-slate-800 bg-[#0f1629]";

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
        className="h-8 w-8 shrink-0 rounded-full object-cover"
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
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white">
      {initials || "U"}
    </span>
  );
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const userId = await getCurrentUserId();
  const signedIn = !!userId;

  const community = await getCommunityBySlug(slug, userId);
  if (!community) notFound();

  const posts = await getPostsByCommunity(community.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-7 text-white sm:px-6 lg:px-8 lg:py-10">
      <Link
        href="/communities"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to communities
      </Link>

      <section className={`${card} overflow-hidden`}>
        <div className="h-24 border-b border-slate-800 bg-[radial-gradient(ellipse_at_75%_20%,rgba(59,130,246,0.24),transparent_60%)] sm:h-28" />

        <div className="px-5 pb-6 sm:px-7">
          <div className="-mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {community.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={community.logo}
                  alt={`${community.name} logo`}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 shrink-0 rounded-2xl border-4 border-[#0f1629] bg-slate-900 object-contain"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-[#0f1629] bg-blue-500/15 text-3xl font-bold text-blue-300">
                  {community.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {community.name}
                </h1>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                  <Users className="h-4 w-4" />
                  {formatCount(community.memberCount)}{" "}
                  {community.memberCount === 1 ? "member" : "members"}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-40">
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
                  className="rounded-md bg-slate-800/80 px-2.5 py-1 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  #{topic}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Latest posts</h2>
              <p className="mt-1 text-xs text-slate-500">
                {posts.length} {posts.length === 1 ? "post" : "posts"} published
              </p>
            </div>

            {signedIn && (
              <Link
                href="/create"
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
              >
                <PenSquare className="h-3.5 w-3.5" />
                Create a post
              </Link>
            )}
          </div>

          {posts.length === 0 ? (
            <div
              className={`${card} flex flex-col items-center px-6 py-14 text-center`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
                <FileText className="h-6 w-6" />
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
                  className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
                >
                  <PenSquare className="h-3.5 w-3.5" />
                  Write the first post
                </Link>
              )}
            </div>
          ) : (
            <div className={`${card} divide-y divide-slate-800`}>
              {posts.map((post) => {
                const authorName = post.author?.name ?? "Unknown author";

                return (
                  <article
                    key={post._id}
                    className="p-5 transition hover:bg-slate-800/20 sm:p-6"
                  >
                    <Link href={`/blogs/${post.slug}`} className="group block">
                      <h3 className="text-lg font-semibold leading-6 text-white transition group-hover:text-blue-300">
                        {post.title}
                      </h3>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                        {post.content}
                      </p>
                    </Link>

                    {post.topics?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.topics.slice(0, 3).map((topic) => (
                          <Link
                            key={topic}
                            href={`/blogs?topic=${encodeURIComponent(topic)}`}
                            className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 transition hover:bg-slate-700"
                          >
                            #{topic}
                          </Link>
                        ))}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {post.author && (
                        <div className="flex items-center gap-2">
                          <AuthorAvatar
                            src={post.author.image}
                            name={authorName}
                          />

                          {post.author.username ? (
                            <Link
                              href={`/profile/${post.author.username}`}
                              className="font-medium text-slate-300 transition hover:text-white"
                            >
                              {authorName}
                            </Link>
                          ) : (
                            <span className="font-medium text-slate-300">
                              {authorName}
                            </span>
                          )}
                        </div>
                      )}

                      <span className="hidden text-slate-700 sm:inline">•</span>

                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {new Date(post.createdAt).toLocaleDateString("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <Link
                        href={`/blogs/${post.slug}`}
                        className="ml-auto font-semibold text-blue-400 transition hover:text-blue-300"
                      >
                        Read post
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className={`${card} p-5`}>
            <h2 className="text-sm font-semibold text-white">
              About this community
            </h2>

            <p className="mt-3 text-xs leading-6 text-slate-400">
              {community.description}
            </p>

            <div className="mt-5 grid grid-cols-2 divide-x divide-slate-800 border-t border-slate-800 pt-4 text-center">
              <div>
                <p className="text-lg font-bold text-white">
                  {formatCount(community.memberCount)}
                </p>
                <p className="text-[11px] text-slate-500">Members</p>
              </div>

              <div>
                <p className="text-lg font-bold text-white">{posts.length}</p>
                <p className="text-[11px] text-slate-500">Posts</p>
              </div>
            </div>
          </section>

          {community.topics.length > 0 && (
            <section className={`${card} p-5`}>
              <h2 className="text-sm font-semibold text-white">
                Community topics
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {community.topics.map((topic) => (
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