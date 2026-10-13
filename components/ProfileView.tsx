import Link from "next/link";
import FollowButton from "./FollowButton";
import PostActions from "./PostActions";

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
  // From the database: do I follow them / do they follow me
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

  // Avoids "/profile/undefined/connections" when a user has no username yet
  const base = user.username ? `/profile/${user.username}` : "/profile";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Profile image */}
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500 text-2xl font-semibold">
              {initials}
            </div>
          )}

          {/* Name + title + username */}
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>

            <p className="text-sm text-gray-400">{user.title || "Developer"}</p>

            {handle && <p className="text-sm text-gray-500">@{handle}</p>}
          </div>
        </div>

        {/* Profile action */}
        {isOwnProfile ? (
          <Link
            href="/settings"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Edit profile
          </Link>
        ) : (
          <FollowButton
            userId={user._id}
            initialFollowing={relationship?.iFollow ?? false}
            followedBy={relationship?.followedBy ?? false}
          />
        )}
      </div>

      {/* Bio */}
      {user.bio && <p className="mt-6 text-gray-300">{user.bio}</p>}

      {/* Stats */}
      <div className="mt-6 flex gap-6 text-sm">
        <Link
          href={`${base}/connections?type=followers`}
          className="hover:text-indigo-400"
        >
          <strong className="text-white">{user.followers ?? 0}</strong>{" "}
          <span className="text-gray-400">followers</span>
        </Link>

        <Link
          href={`${base}/connections?type=following`}
          className="hover:text-indigo-400"
        >
          <strong className="text-white">{user.following ?? 0}</strong>{" "}
          <span className="text-gray-400">following</span>
        </Link>

        <span>
          <strong className="text-white">{posts.length}</strong>{" "}
          <span className="text-gray-400">posts</span>
        </span>
      </div>

      {/* Posts */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">Posts</h2>

      <div className="space-y-3">
        {posts.length === 0 && (
          <p className="text-sm text-gray-500">No posts yet.</p>
        )}

        {posts.map((post) => (
          <article
            key={post._id}
            className="rounded-lg border border-gray-800 bg-gray-900 p-4"
          >
            <Link
              href={`/blogs/${post.slug}`}
              className="font-medium hover:text-blue-300"
            >
              {post.title}
            </Link>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
              {post.createdAt && (
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              )}

              {post.editedAt && (
                <span title={new Date(post.editedAt).toLocaleString()}>
                  · Edited {new Date(post.editedAt).toLocaleDateString()}
                </span>
              )}

              {post.community && <span>· {post.community.name}</span>}

              {!isOwnProfile && post.published === false && (
                <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-yellow-300">
                  Draft
                </span>
              )}
            </div>

            {/* Edit / Publish / Delete, only on your own profile */}
            {isOwnProfile && (
              <PostActions
                postId={post._id}
                slug={post.slug}
                published={post.published !== false}
              />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}