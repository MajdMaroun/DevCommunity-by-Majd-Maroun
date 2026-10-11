import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb"
import Community from "@/lib/models/Community";

export async function getAllCommunities(userId: string | null) {
  await connectToDatabase(); // same import as your action
  const uid = userId ? new Types.ObjectId(userId) : null;

  const rows = await Community.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $project: {
        slug: 1, name: 1, description: 1, logo: 1, topics: 1,
        memberCount: { $size: { $ifNull: ["$members", []] } },
        joined: uid ? { $in: [uid, { $ifNull: ["$members", []] }] } : false,
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