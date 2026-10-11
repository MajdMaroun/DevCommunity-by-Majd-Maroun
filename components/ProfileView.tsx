import Link from "next/link";
import FollowButton from "./FollowButton";

type ProfileUser = {
  username?: string;
  name: string;
  email?: string;
  image?: string | null;
  bio?: string;
  followers?: number;
  following?: number;
  posts?: { _id: string; title: string; slug: string }[];
};

export default function ProfileView({
  user,
  isOwnProfile = false,
}: {
  user: ProfileUser;
  isOwnProfile?: boolean;
}) {
  const posts = user.posts ?? [];

  const initials = (user.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handle = user.username ?? user.email?.split("@")[0];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-white">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
{user.image ? (
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
)}          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {handle && <p className="text-sm text-gray-400">@{handle}</p>}
          </div>
        </div>

        {isOwnProfile ? (
          <Link
            href="/settings"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Edit profile
          </Link>
        ) : (
          <FollowButton />
        )}
      </div>

      {user.bio && <p className="mt-6 text-gray-300">{user.bio}</p>}

      {/* Stats */}
      <div className="mt-6 flex gap-6 text-sm">
        <span>
          <strong className="text-white">{user.followers ?? 0}</strong>{" "}
          <span className="text-gray-400">followers</span>
        </span>
        <span>
          <strong className="text-white">{user.following ?? 0}</strong>{" "}
          <span className="text-gray-400">following</span>
        </span>
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
            <h3 className="font-medium">{post.title}</h3>
          </article>
        ))}
      </div>
    </div>
  );
}