import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Community from "@/lib/models/Community";

export async function getAllCommunities(userId: string | null) {
  await connectToDatabase();

  const uid = userId ? new Types.ObjectId(userId) : null;

  const rows = await Community.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $project: {
        slug: 1,
        name: 1,
        description: 1,
        logo: 1,
        topics: 1,
        memberCount: {
          $size: { $ifNull: ["$members", []] },
        },
        joined: uid
          ? { $in: [uid, { $ifNull: ["$members", []] }] }
          : { $literal: false },
      },
    },
  ]);

  return rows.map((r) => ({
    id: r._id.toString(),
    slug: r.slug,
    name: r.name,
    description: r.description,
    logo: r.logo,
    topics: r.topics ?? [],
    memberCount: r.memberCount,
    joined: r.joined,
  }));
}

export async function getCommunityBySlug(
  slug: string,
  userId: string | null
) {
  await connectToDatabase();

  const c = await Community.findOne({ slug }).lean();

  if (!c) return null;

  const members = (c.members ?? []).map((m: unknown) => String(m));

  return {
    id: String(c._id),
    slug: c.slug,
    name: c.name,
    description: c.description,
    logo: c.logo as string | undefined,
    topics: (c.topics ?? []) as string[],
    createdAt: new Date(c.createdAt as Date).toISOString(),
    memberCount: members.length,
    joined: userId ? members.includes(userId) : false,
  };
}

