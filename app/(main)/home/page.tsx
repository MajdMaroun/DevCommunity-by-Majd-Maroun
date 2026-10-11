import { Types } from "mongoose";
import { connectToDatabase as connectDB } from "@/lib/mongodb";
import Community from "@/lib/models/Community";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";

/* ---------- types ---------- */

export type CommunityCardData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  topics: string[];
  logo?: string;
  memberCount: number;
  joined: boolean;
};

export type BlogCardData = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover?: string;
  topic?: string;
  authorName: string;
  authorImage?: string;
  date: string;
  readMinutes: number;
};

export type ProfileData = {
  name: string;
  image?: string;
  title: string;
  bio: string;
  location: string;
  joined: string;
  skills: string[];
  stats: { label: string; value: number }[];
};

export type TrendingTopic = { topic: string; posts: number };

/* ---------- helpers ---------- */

const oid = (id: string) => new Types.ObjectId(id);

const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString("en-US", opts);

const readMinutes = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));

const excerpt = (text: string, max = 140) =>
  text.length > max ? text.slice(0, max).trimEnd() + "…" : text;

/* ---------- queries ---------- */

/** Most popular communities, flagged with whether the current user joined. */
export async function getFeaturedCommunities(
  userId: string | null,
  limit = 6
): Promise<CommunityCardData[]> {
  await connectDB();

  const rows = await Community.aggregate([
    {
      $addFields: {
        memberCount: { $size: { $ifNull: ["$members", []] } },
        joined: userId
          ? { $in: [oid(userId), { $ifNull: ["$members", []] }] }
          : false,
      },
    },
    { $sort: { memberCount: -1, name: 1 } },
    { $limit: limit },
  ]);

  return rows.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    topics: c.topics ?? [],
    logo: c.logo,
    memberCount: c.memberCount,
    joined: c.joined,
  }));
}

/** Communities the current user has joined. */
export async function getMyCommunities(
  userId: string | null,
  limit = 3
): Promise<CommunityCardData[]> {
  if (!userId) return [];
  await connectDB();

  const rows = await Community.find({ members: oid(userId) })
    .sort({ name: 1 })
    .limit(limit)
    .lean();

  return rows.map((c: any) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    topics: c.topics ?? [],
    logo: c.logo,
    memberCount: c.members?.length ?? 0,
    joined: true,
  }));
}

/** Latest posts with the author populated (fixes the raw author id). */
export async function getLatestBlogs(limit = 3): Promise<BlogCardData[]> {
  await connectDB();

  const rows = await Post.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", "name image")
    .lean();

  return rows.map((p: any) => ({
    id: p._id.toString(),
    slug: p.slug ?? p._id.toString(),
    title: p.title,
    excerpt: excerpt(p.content ?? ""),
    cover: p.coverImage,
    topic: p.topics?.[0],
    authorName: p.author?.name ?? "Unknown author",
    authorImage: p.author?.image,
    date: fmtDate(p.createdAt, { month: "short", day: "numeric", year: "numeric" }),
    readMinutes: readMinutes(p.content ?? ""),
  }));
}

/** Profile card for the signed-in user. */
export async function getProfile(userId: string | null): Promise<ProfileData | null> {
  if (!userId) return null;
  await connectDB();

  const [user, posts, communities]: [any, number, number] = await Promise.all([
    User.findById(userId).lean(),
    Post.countDocuments({ author: oid(userId) }),
    Community.countDocuments({ members: oid(userId) }),
  ]);
  if (!user) return null;

  return {
    name: user.name,
    image: user.image,
    title: user.title ?? "Developer",
    bio: user.bio ?? "",
    location: user.location ?? "",
    joined: fmtDate(user.createdAt, { month: "short", year: "numeric" }),
    skills: user.skills ?? [],
    stats: [
      { label: "Posts", value: posts },
      { label: "Communities", value: communities },
      { label: "Followers", value: user.followers?.length ?? 0 },
    ],
  };
}

/** Topics ranked by number of posts. */
export async function getTrendingTopics(limit = 5): Promise<TrendingTopic[]> {
  await connectDB();

  const rows = await Post.aggregate([
    { $unwind: "$topics" },
    { $group: { _id: "$topics", posts: { $sum: 1 } } },
    { $sort: { posts: -1, _id: 1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({ topic: r._id, posts: r.posts }));
}