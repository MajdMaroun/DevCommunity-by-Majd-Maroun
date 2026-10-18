import { Types } from "mongoose";

import { connectToDatabase as connectDB } from "@/lib/mongodb";

import Community from "@/lib/models/Community";
import Post from "@/lib/models/Post";
import User from "@/lib/models/User";
import { cacheLife, cacheTag } from "next/cache";

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

export type TrendingTopic = {
  topic: string;
  posts: number;
};

/* ---------- helpers ---------- */

// Validate and convert IDs before using them in MongoDB queries.
const oid = (id: string) => new Types.ObjectId(id);

// Format dates consistently for the homepage.
const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Date(d).toLocaleDateString("en-US", opts);

// Estimate reading time without loading additional data.
const readMinutes = (text: string) =>
  Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));

// Generate a short preview for each blog card.
const excerpt = (text: string, max = 140) =>
  text.length > max ? text.slice(0, max).trimEnd() + "…" : text;

/* ---------- queries ---------- */

/**
 * Returns the most popular communities.
 *
 * Optimization:
 * - Performs the aggregation in MongoDB rather than loading every
 *   community into Node.js.
 * - Applies the limit in MongoDB.
 * - Calculates whether the current user has joined each community.
 *
 * Note:
 * MongoDB still needs to calculate member counts and sort the
 * communities. Caching or storing member counts could improve this
 * further, but requires changes to the membership update logic.
 */
export async function getFeaturedCommunities(
  userId: string | null,
  limit = 6
): Promise<CommunityCardData[]> {
  await connectDB();

  // Convert the user ID once instead of repeatedly inside the query.
  const userObjectId = userId ? oid(userId) : null;

  const rows = await Community.aggregate([
    {
      $addFields: {
        // Handle communities that do not have a members array.
        memberCount: {
          $size: {
            $ifNull: ["$members", []],
          },
        },

        // Avoid checking membership when the visitor is signed out.
        joined: userObjectId
          ? {
              $in: [
                userObjectId,
                { $ifNull: ["$members", []] },
              ],
            }
          : false,
      },
    },

    // Sort by popularity, then name for consistent ordering.
    {
      $sort: {
        memberCount: -1,
        name: 1,
      },
    },

    // Return only the communities needed for the homepage.
    {
      $limit: limit,
    },

    // Return only fields required by the community cards.
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        topics: 1,
        logo: 1,
        memberCount: 1,
        joined: 1,
      },
    },
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

/**
 * Returns communities joined by the current user.
 *
 * Optimization:
 * - Avoids connecting to MongoDB for signed-out visitors.
 * - Selects only fields required by the homepage.
 * - Uses lean() to avoid creating full Mongoose document instances.
 * - Limits the result to three communities by default.
 */
export async function getMyCommunities(
  userId: string | null,
  limit = 3
): Promise<CommunityCardData[]> {
  // No database query is needed for signed-out visitors.
  if (!userId) return [];

  await connectDB();

  const userObjectId = oid(userId);

  const rows = await Community.find({
    members: userObjectId,
  })
    // Only retrieve fields used to render the community cards.
    .select("name slug description topics logo members")
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

/**
 * Returns the latest blog posts and their author information.
 *
 * Optimization:
 * - Selects only the fields displayed or processed by the homepage.
 * - Limits the number of posts returned.
 * - Uses lean() to reduce Mongoose document overhead.
 * - Retrieves only the author's name and image.
 * - Adds _id as a secondary sort key for consistent ordering.
 */
export async function getLatestBlogs(
  limit = 3
): Promise<BlogCardData[]> {
  await connectDB();

  const rows = await Post.find({ published: true })
    .select("slug title content cover topics author createdAt")
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit)
    .populate({
      path: "author",
      select: "name image",
    })
    .lean();

  return rows.map((p: any) => ({
    id: p._id.toString(),
    slug: p.slug ?? p._id.toString(),
    title: p.title,
    excerpt: excerpt(p.content ?? ""),
    cover: p.cover,
    topic: p.topics?.[0],
    authorName: p.author?.name ?? "Unknown author",
    authorImage: p.author?.image,
    date: fmtDate(p.createdAt, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    readMinutes: readMinutes(p.content ?? ""),
  }));
}

/**
 * Returns the current user's profile card.
 *
 * Optimization:
 * - Avoids database access for signed-out visitors.
 * - Selects only fields required by the profile card.
 * - Uses lean() for the read-only user query.
 * - Runs the user lookup and two count queries in parallel.
 *
 * The counts remain database queries because the homepage displays
 * the current user's post and community totals.
 */

export async function getProfile(
  userId: string | null
): Promise<ProfileData | null> {
  if (!userId) return null;

  await connectDB();

  const userObjectId = oid(userId);

  // Run independent queries concurrently instead of sequentially.
  const [user, posts, communities] = await Promise.all([
    User.findById(userObjectId)
      // Do not retrieve unrelated user fields.
      .select(
        "name image title bio location createdAt skills followers"
      )
      .lean(),

    // An index on Post.author can help this count query.
    Post.countDocuments({
      author: userObjectId,
    }),

    // An index on Community.members can help this count query.
    Community.countDocuments({
      members: userObjectId,
    }),
  ]);

  if (!user) return null;

  return {
    name: user.name,
    image: user.image,
    title: user.title ?? "Developer",
    bio: user.bio ?? "",
    location: (user as typeof user & { location?: string }).location ?? "",
    joined: fmtDate((user as typeof user & { createdAt: Date }).createdAt, {
      month: "short",
      year: "numeric",
    }),
    skills: (user as typeof user & { skills?: string[] }).skills ?? [],
    stats: [
      {
        label: "Posts",
        value: posts,
      },
      {
        label: "Communities",
        value: communities,
      },
      {
        label: "Followers",
        value: user.followers ?? 0,
      },
    ],
  };
}

/**
 * Returns topics ranked by the number of posts containing each topic.
 *
 * Optimization:
 * - Performs grouping and counting inside MongoDB.
 * - Limits the returned results.
 * - Projects only the fields needed by the homepage.
 *
 * Note:
 * The aggregation still processes the matching posts on each call.
 * Caching is a separate optimization and should be configured after
 * checking the project's Next.js caching settings.
 */
export async function getTrendingTopics(
  limit = 5
): Promise<TrendingTopic[]> {
  await connectDB();

  const rows = await Post.aggregate([
    // Convert the topics array into individual topic entries.
    { $unwind: "$topics" },

    // Count how many posts contain each topic.
    {
      $group: {
        _id: "$topics",
        posts: {
          $sum: 1,
        },
      },
    },

    // Put the most popular topics first.
    {
      $sort: {
        posts: -1,
        _id: 1,
      },
    },

    // Return only the topics shown on the homepage.
    {
      $limit: limit,
    },

    // Keep the aggregation output small.
    {
      $project: {
        _id: 0,
        topic: "$_id",
        posts: 1,
      },
    },
  ]);

  return rows.map((r) => ({
    topic: r.topic,
    posts: r.posts,
  }));
}

  export type PublicCommunityData = Omit<CommunityCardData, "joined">;
 
/**
 * PUBLIC part of "Featured communities": the same list for every visitor, so it can be cached.
 * It has no `joined` flag, because that is personal and must never be cached.
 * The cache refreshes about every minute, or immediately when a membership changes
 * (the join/leave action calls updateTag("communities")).
 */
export async function getFeaturedCommunitiesPublic(
  limit = 6
): Promise<PublicCommunityData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("communities");
 
  await connectDB();
 
  const rows = await Community.aggregate([
    {
      $addFields: {
        memberCount: { $size: { $ifNull: ["$members", []] } },
      },
    },
    { $sort: { memberCount: -1, name: 1 } },
    { $limit: limit },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        topics: 1,
        logo: 1,
        memberCount: 1,
      },
    },
  ]);
 
  return rows.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    topics: c.topics ?? [],
    logo: c.logo,
    memberCount: c.memberCount,
  }));
}
 
/**
 * PERSONAL part: which of these communities has this user joined?
 * A tiny query that is never cached.
 */
export async function getJoinedCommunityIds(
  userId: string | null,
  communityIds: string[]
): Promise<string[]> {
  if (!userId || communityIds.length === 0) return [];
 
  await connectDB();
 
  const rows = await Community.find({
    _id: { $in: communityIds.map(oid) },
    members: oid(userId),
  })
    .select("_id")
    .lean();
 
  return rows.map((r) => String(r._id));
}