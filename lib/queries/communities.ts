import { connectToDatabase } from "../mongodb";
import Community from "../models/Community";

export async function getCommunities() {
  await connectToDatabase();

  const communities = await Community.find()
    .sort({ createdAt: -1 })
    .lean();

  return communities;
}