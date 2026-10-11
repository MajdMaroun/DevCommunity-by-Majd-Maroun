import Link from "next/link";
import BookmarkButton from "@/components/BookmarkButton";
import {
  ArrowRight,
  Calendar,
  Flame,
  MapPin,
  PenSquare,
  Users,
} from "lucide-react";
import JoinButton from "@/components/JoinButton";
import { auth } from "@/auth";
import {
  getFeaturedCommunities,
  getLatestBlogs,
  getMyCommunities,
  getProfile,
  getTrendingTopics,
} from "@/app/(main)/home/page";

export const dynamic = "force-dynamic"; // membership + trending change often

/* ---------- helpers ---------- */

// 1500 -> "1.5K", 2000000 -> "2M"
function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}K`;
  return String(n);
}

// Letter tile shown when a community has no logo
function Initial({ name, className = "" }: { name: string; className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-blue-500/15 font-bold text-blue-300 ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Logo({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className: string;
}) {
  if (!src) return <Initial name={name} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className={`${className} rounded-xl object-contain`}
    />
  );
}

// User avatar, with a gradient placeholder when there is no photo
function Avatar({ src, className }: { src?: string | null; className: string }) {
  if (!src)
    return (
      <span
        className={`${className} shrink-0 rounded-full bg-gradient-to-br from-slate-600 to-slate-800`}
      />
    );
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className={`${className} shrink-0 rounded-full object-cover`}
    />
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
      >
        View all <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

const card = "rounded-xl border border-slate-800 bg-[#0f1629]";
const chip = "rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300";

/* ---------- page ---------- */

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const signedIn = !!userId;

  const [featured, myCommunities, blogs, dbProfile, trending] = await Promise.all([
    getFeaturedCommunities(userId),
    getMyCommunities(userId),
    getLatestBlogs(),
    getProfile(userId),
    getTrendingTopics(),
  ]);

  // Use the database profile when it exists. Otherwise (e.g. a brand-new
  // Google/GitHub user) fall back to the Auth.js session so the card still shows.
  const profile = dbProfile
    ? { ...dbProfile, image: dbProfile.image ?? session?.user?.image ?? undefined }
    : session?.user
      ? {
          name: session.user.name ?? session.user.email ?? "User",
          image: session.user.image ?? undefined,
          headline: session.user.email ?? "",
          bio: "",
          location: "",
          joined: "",
          stats: [] as { label: string; value: string | number }[],
          skills: [] as string[],
        }
      : null;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* ================= CENTER ================= */}
      <div className="min-w-0 space-y-6">
        {/* Hero */}
        <section
          className={`${card} relative overflow-hidden bg-[radial-gradient(ellipse_at_85%_40%,rgba(59,130,246,0.18),transparent_60%)] px-8 py-8`}
        >
          <p className="mb-2 text-[11px] font-semibold tracking-[0.2em] text-blue-400">
            BUILD • SHARE • LEARN
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Explore developer communities
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300">
            Join communities, read insightful blogs, share your knowledge and
            grow with developers around the world.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/communities"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Browse Communities <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <PenSquare className="h-4 w-4" /> Create a Post
            </Link>
          </div>
        </section>

        {/* Featured Communities */}
        <section>
          <SectionHeader title="Featured Communities" href="/communities" />
          {featured.length === 0 ? (
            <p className={`${card} p-6 text-sm text-slate-400`}>
              No communities yet. Be the first to{" "}
              <Link href="/communities/create" className="text-blue-400 hover:text-blue-300">
                create one
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              {featured.map((c) => (
                <div key={c.id} className={`${card} flex flex-col p-4`}>
                  <Link href={`/communities/${c.slug}`} className="block">
                    <Logo name={c.name} src={c.logo} className="h-11 w-11 text-lg" />
                    <h3 className="mt-3 text-sm font-semibold text-white">{c.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs text-slate-400">
                      {c.description}
                    </p>
                  </Link>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {c.topics.slice(0, 2).map((t) => (
                      <span key={t} className={chip}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    {formatCount(c.memberCount)} members
                  </p>

                  <JoinButton communityId={c.id} joined={c.joined} signedIn={signedIn} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Latest Blogs */}
        <section>
          <SectionHeader title="Latest Blogs" href="/blogs" />
          {blogs.length === 0 ? (
            <p className={`${card} p-6 text-sm text-slate-400`}>No posts yet.</p>
          ) : (
            <div className={`${card} divide-y divide-slate-800`}>
              {blogs.map((b) => (
                <article key={b.id} className="flex items-center gap-4 p-3">
                  <Link href={`/blogs/${b.slug}`} className="shrink-0">
                    {b.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.cover}
                        alt=""
                        className="h-[62px] w-[132px] rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-[62px] w-[132px] rounded-md bg-gradient-to-br from-slate-800 to-slate-900" />
                    )}
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link href={`/blogs/${b.slug}`}>
                      <h3 className="truncate text-sm font-semibold text-white hover:text-blue-300">
                        {b.title}
                      </h3>
                    </Link>

                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{b.excerpt}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <Avatar src={b.authorImage} className="h-4 w-4" />
                      <span>{b.authorName}</span>
                      <span>·</span>
                      <span>{b.date}</span>
                      <span>·</span>
                      <span>{b.readMinutes} min read</span>
                      {b.topic && (
                        <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-blue-300">
                          {b.topic}
                        </span>
                      )}
                    </div>
                  </div>

                  <BookmarkButton
                    post={{ id: b.id, title: b.title, href: `/blogs/${b.slug}` }}
                  />
                  <Link
                    href={`/blogs/${b.slug}`}
                    className="hidden rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 sm:block"
                  >
                    Read Blog
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ================= RIGHT ================= */}
      <aside className="space-y-4">
        {/* Profile (or sign-in prompt) */}
        {profile ? (
          <section className={`${card} p-5`}>
            <div className="flex items-center gap-3">
              <Avatar src={profile.image} className="h-14 w-14" />
              <div className="min-w-0">
                <h2 className="truncate font-semibold text-white">{profile.name}</h2>
                {profile.headline && (
                  <p className="truncate text-xs text-slate-400">{profile.headline}</p>
                )}
              </div>
            </div>

            {profile.bio && (
              <p className="mt-4 text-xs leading-relaxed text-slate-300">{profile.bio}</p>
            )}

            {(profile.location || profile.joined) && (
              <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {profile.location}
                  </span>
                )}
                {profile.joined && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Joined {profile.joined}
                  </span>
                )}
              </div>
            )}

            {profile.stats.length > 0 && (
              <div className="mt-4 grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800 pt-4 text-center">
                {profile.stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[11px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {profile.skills.length > 0 && (
              <div className="mt-4 border-t border-slate-800 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Skills</h3>
                  <Link href="/settings" className="text-xs text-blue-400 hover:text-blue-300">
                    Edit
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              href="/profile"
              className="mt-4 block rounded-lg border border-slate-700 py-2 text-center text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              View profile
            </Link>
          </section>
        ) : (
          <section className={`${card} p-5`}>
            <h2 className="font-semibold text-white">Join DevCommunity</h2>
            <p className="mt-1 text-xs text-slate-400">
              Sign in to join communities, bookmark blogs and publish your own posts.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Sign in
            </Link>
          </section>
        )}

        {/* My Communities */}
        {signedIn && (
          <section className={`${card} p-4`}>
            <SectionHeader title="My Communities" href="/communities" />
            {myCommunities.length === 0 ? (
              <p className="text-xs text-slate-400">
                You haven&apos;t joined any communities yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {myCommunities.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <Logo name={c.name} src={c.logo} className="h-9 w-9 text-sm" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/communities/${c.slug}`}
                        className="block truncate text-sm font-medium text-white hover:text-blue-300"
                      >
                        {c.name}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {formatCount(c.memberCount)} members
                      </p>
                    </div>
                    <JoinButton communityId={c.id} joined signedIn compact />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Trending Topics */}
        <section className={`${card} p-4`}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Flame className="h-4 w-4 text-orange-400" /> Trending Topics
            </h2>
            <Link
              href="/blogs"
              className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {trending.length === 0 ? (
            <p className="text-xs text-slate-400">Topics will appear as people post.</p>
          ) : (
            <ol className="space-y-1">
              {trending.map((t, i) => (
                <li key={t.topic}>
                  <Link
                    href={`/blogs?topic=${encodeURIComponent(t.topic)}`}
                    className="flex items-center gap-3 rounded-md px-1 py-2 text-sm hover:bg-slate-800/50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[11px] text-slate-300">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-slate-200">{t.topic}</span>
                    <span className="text-xs text-slate-400">
                      {formatCount(t.posts)} posts
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      </aside>
    </div>
  );
}