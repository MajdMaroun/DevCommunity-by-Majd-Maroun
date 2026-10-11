import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, PenSquare } from "lucide-react";
import JoinButton from "@/components/JoinButton";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getCommunityBySlug } from "@/lib/queries/communities";
import { getPostsByCommunity } from "@/lib/queries/post";

export const dynamic = "force-dynamic"; // membership + posts change often

const card = "rounded-xl border border-slate-800 bg-[#0f1629]";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Same helper toggleMembership uses, so "joined" matches what the action writes
  const userId = await getCurrentUserId();
  const signedIn = !!userId;

  const community = await getCommunityBySlug(slug, userId);
  if (!community) notFound();

  const posts = await getPostsByCommunity(community.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10 text-white">
      {/* Header */}
      <section className={`${card} p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {community.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.logo}
                alt=""
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-500/15 text-2xl font-bold text-blue-300">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{community.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
                <Users className="h-4 w-4" />
                {community.memberCount}{" "}
                {community.memberCount === 1 ? "member" : "members"}
              </p>
            </div>
          </div>

          <div className="w-40">
            <JoinButton
              communityId={community.id}
              joined={community.joined}
              signedIn={signedIn}
            />
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {community.description}
        </p>

        {community.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {community.topics.map((t) => (
              <span
                key={t}
                className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Posts */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Posts</h2>
          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            <PenSquare className="h-3.5 w-3.5" /> Create a Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className={`${card} p-6 text-sm text-slate-400`}>
            No posts in this community yet.
          </p>
        ) : (
          <div className={`${card} divide-y divide-slate-800`}>
            {posts.map((p) => (
              <article key={p._id} className="p-4">
                <Link
                  href={`/blogs/${p.slug}`}
                  className="font-semibold hover:text-blue-300"
                >
                  {p.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {p.content}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  {p.author &&
                    (p.author.username ? (
                      <Link
                        href={`/profile/${p.author.username}`}
                        className="hover:text-white"
                      >
                        {p.author.name}
                      </Link>
                    ) : (
                      <span>{p.author.name}</span>
                    ))}
                  <span>·</span>
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  {p.topics?.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-slate-800/80 px-2 py-0.5 text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}