import Link from "next/link";
import FollowButton from "./FollowButton";
import PostActions from "./PostActions";
import {
  Pencil,
  FileText,
  Users,
  CalendarDays,
  ArrowUpRight,
  AtSign,
} from "lucide-react";

export type ProfilePost = {
  _id: string;
  title: string;
  slug: string;
  topics?: string[];
  published?: boolean;
  createdAt?: string;
  editedAt?: string;
  community?: {
    name: string;
    slug: string;
  };
};

type ProfileUser = {
  _id: string;
  username?: string;
  name: string;
  title?: string;
  email?: string;
  image?: string | null;
  bio?: string;
  followers?: number;
  following?: number;
  posts?: ProfilePost[];
};

export default function ProfileView({
  user,
  posts: postsProp,
  isOwnProfile = false,
  relationship,
}: {
  user: ProfileUser;
  posts?: ProfilePost[];
  isOwnProfile?: boolean;
  relationship?: { iFollow: boolean; followedBy: boolean };
}) {
  const posts = postsProp ?? user.posts ?? [];

  const initials = (user.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handle = user.username ?? user.email?.split("@")[0];
  const base = user.username ? `/profile/${user.username}` : "/profile";
  const professionalTitle = user.title?.trim();

  return (
    <main className="mx-auto w-full max-w-4xl text-white sm:px-6 sm:py-8 lg:px-8">
      {/* Profile card */}
      <section className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-xl shadow-black/10">
        <div className="px-4 pb-5 sm:px-7 sm:pb-7">
          {/* Avatar and user information */}
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 shrink-0 rounded-2xl border-4 border-gray-950 bg-gray-900 object-cover sm:h-28 sm:w-28"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-gray-950 bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-bold shadow-lg sm:h-28 sm:w-28 sm:text-3xl">
                  {initials}
                </div>
              )}

              {/* Name, title, username, and bio */}
              <div className="min-w-0 flex-1 pt-1">
                <h1 className="break-words text-xl font-bold tracking-tight sm:text-3xl">
                  {user.name}
                </h1>

                {professionalTitle && (
                  <p className="mt-1 break-words text-sm font-medium text-indigo-300 sm:text-base">
                    {professionalTitle}
                  </p>
                )}

                {handle && (
                  <p className="mt-1 flex min-w-0 items-center gap-1 break-all text-sm text-gray-500">
                    <AtSign size={14} className="shrink-0" />
                    {handle}
                  </p>
                )}

              </div>
            </div>

            {/*Bio / Edit profile / Follow button underneath */}
            <div className="flex w-full flex-wrap gap-2">
              {user.bio ? (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-300 sm:text-base">
                    {user.bio}
                  </p>
                ) : (
                  isOwnProfile && (
                    <p className="mt-3 text-sm text-gray-500">
                      Add a bio to tell the community a little about yourself.
                    </p>
                  )
                )}
              {isOwnProfile ? (
                <Link
                  href="/settings"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-200 transition hover:border-indigo-500/50 hover:bg-gray-800 sm:w-auto"
                >
                  <Pencil size={15} />
                  Edit profile
                </Link>
              ) : (
                <div className="w-full sm:w-auto">
                  <FollowButton
                    userId={user._id}
                    initialFollowing={relationship?.iFollow ?? false}
                    followedBy={relationship?.followedBy ?? false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-gray-800 rounded-xl border border-gray-800 bg-gray-900/60 py-4">
            <Link
              href={`${base}/connections?type=followers`}
              className="group flex min-w-0 flex-col items-center gap-1 px-1 transition hover:bg-gray-800/40"
            >
              <span className="flex items-center gap-1.5 text-gray-500">
                <Users size={14} />
                <span className="text-xs sm:text-sm">Followers</span>
              </span>
              <strong className="text-lg font-bold text-white transition group-hover:text-indigo-300 sm:text-xl">
                {user.followers ?? 0}
              </strong>
            </Link>

            <Link
              href={`${base}/connections?type=following`}
              className="group flex min-w-0 flex-col items-center gap-1 px-1 transition hover:bg-gray-800/40"
            >
              <span className="flex items-center gap-1.5 text-gray-500">
                <Users size={14} />
                <span className="text-xs sm:text-sm">Following</span>
              </span>
              <strong className="text-lg font-bold text-white transition group-hover:text-indigo-300 sm:text-xl">
                {user.following ?? 0}
              </strong>
            </Link>

            <div className="flex min-w-0 flex-col items-center gap-1 px-1">
              <span className="flex items-center gap-1.5 text-gray-500">
                <FileText size={14} />
                <span className="text-xs sm:text-sm">Posts</span>
              </span>
              <strong className="text-lg font-bold text-white sm:text-xl">
                {posts.length}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="mt-7 sm:mt-9">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {isOwnProfile ? "Your posts" : "Posts"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {posts.length === 1 ? "1 post" : `${posts.length} posts`}
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-800 bg-gray-950/60 px-5 py-12 text-center sm:py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
              <FileText size={24} className="text-gray-500" />
            </div>

            <h3 className="mt-4 font-semibold text-gray-200">
              No posts yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              {isOwnProfile
                ? "Your articles will appear here when you start sharing with the community."
                : "This user hasn't shared any posts yet."}
            </p>

            {isOwnProfile && (
              <Link
                href="/blogs"
                className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Explore blogs
                <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article
                key={post._id}
                className="group min-w-0 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 p-4 transition duration-200 hover:border-gray-700 hover:bg-gray-900/80 sm:p-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/blogs/${post.slug}`}
                      className="block break-words text-base font-semibold leading-6 text-gray-100 transition group-hover:text-indigo-300 sm:text-lg"
                    >
                      {post.title}
                    </Link>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                      {post.createdAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      )}

                      {post.editedAt && (
                        <span
                          title={new Date(post.editedAt).toLocaleString()}
                          className="break-words"
                        >
                          Edited{" "}
                          {new Date(post.editedAt).toLocaleDateString()}
                        </span>
                      )}

                      {post.community && (
                        <span className="max-w-full break-words rounded-md border border-gray-800 bg-gray-900 px-2 py-1">
                          {post.community.name}
                        </span>
                      )}

                      {!isOwnProfile && post.published === false && (
                        <span className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-1 font-medium text-yellow-300">
                          Draft
                        </span>
                      )}
                    </div>

                    {post.topics && post.topics.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {post.topics.slice(0, 4).map((topic) => (
                          <span
                            key={topic}
                            className="max-w-full break-words rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/blogs/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                    className="hidden shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-800 hover:text-white sm:block"
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </div>

                {/* Post actions */}
                {isOwnProfile && (
                  <div className="mt-4 border-t border-gray-800/80 pt-3">
                    <PostActions
                      postId={post._id}
                      slug={post.slug}
                      published={post.published !== false}
                    />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}