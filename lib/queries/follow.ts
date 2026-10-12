// lib/queries/follows.ts
import { connectToDatabase } from "@/lib/mongodb";
import Follow from "@/lib/models/Follow";

// iFollow:    the viewer follows the target
// followedBy: the target follows the viewer
export async function getRelationship(viewerId: string | null, targetId: string) {
  if (!viewerId || viewerId === targetId) {
    return { iFollow: false, followedBy: false };
  }

  await connectToDatabase();

  const [mine, theirs] = await Promise.all([
    Follow.exists({ follower: viewerId, following: targetId }),
    Follow.exists({ follower: targetId, following: viewerId }),
  ]);

  return { iFollow: !!mine, followedBy: !!theirs };
}

// Same check for many users at once (followers / following lists).
// Returns a map: userId -> { iFollow, followedBy }, using 2 queries total.
export async function getRelationships(
  viewerId: string | null,
  userIds: string[]
) {
  const map: Record<string, { iFollow: boolean; followedBy: boolean }> = {};
  for (const id of userIds) map[id] = { iFollow: false, followedBy: false };

  if (!viewerId || userIds.length === 0) return map;

  await connectToDatabase();

  const [mine, theirs] = await Promise.all([
    // people in the list that I follow
    Follow.find({ follower: viewerId, following: { $in: userIds } })
      .select("following")
      .lean(),
    // people in the list that follow me
    Follow.find({ follower: { $in: userIds }, following: viewerId })
      .select("follower")
      .lean(),
  ]);

  for (const f of mine) {
    const id = String(f.following);
    if (map[id]) map[id].iFollow = true;
  }
  for (const f of theirs) {
    const id = String(f.follower);
    if (map[id]) map[id].followedBy = true;
  }

  return map;
}