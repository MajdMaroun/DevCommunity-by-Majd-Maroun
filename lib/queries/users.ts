import { connectToDatabase } from "../mongodb";
import User from "../models/User";
import Post from "../models/Post";

export async function getUser(username: string) {
  await connectToDatabase();

  const user = await User.findOne({ username: username.toLowerCase() }).lean();
  if (!user) return null;

  const posts = await Post.find({ author: user._id, published: true })
    .sort({ createdAt: -1 })
    .select("title slug")
    .lean();

  return JSON.parse(JSON.stringify({ ...user, posts }));
}

// Temporary: replace with your real auth/session lookup
export async function getCurrentUser() {
  await connectToDatabase();

  const user = await User.findOne().lean();
  if (!user) return null;

  const posts = await Post.find({ author: user._id, published: true })
    .sort({ createdAt: -1 })
    .select("title slug")
    .lean();

  return JSON.parse(JSON.stringify({ ...user, posts }));
}

export async function updateUser(
  id: string,
  data: { name: string; username: string; bio: string }
) {
  await connectToDatabase();

  const taken = await User.findOne({
    username: data.username.toLowerCase(),
    _id: { $ne: id },
  }).lean();

  if (taken) return { error: "That username is already taken." };

  await User.findByIdAndUpdate(id, {
    name: data.name,
    username: data.username.toLowerCase(),
    bio: data.bio,
  });

  return { success: true };
}