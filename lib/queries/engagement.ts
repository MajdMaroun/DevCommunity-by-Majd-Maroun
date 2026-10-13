import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Like from "@/lib/models/Like";
import Comment from "@/lib/models/Comment";

export async function getLikeState(postId: string, userId: string | null) {
  await connectToDatabase();

  const [count, mine] = await Promise.all([
    Like.countDocuments({ post: postId }),
    userId ? Like.exists({ post: postId, user: userId }) : Promise.resolve(null),
  ]);

  return { count, liked: !!mine };
}

export type CommentItem = {
  _id: string;
  content: string;
  createdAt: string;
  author?: { _id: string; name: string; username?: string; image?: string | null } | null;
};

// Newest first, capped so a popular post cannot send thousands of rows
export async function getComments(postId: string, limit = 100): Promise<CommentItem[]> {
  await connectToDatabase();

  const docs = await Comment.find({ post: postId })
    .populate({ path: "author", model: User, select: "name username image" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return JSON.parse(JSON.stringify(docs));
}