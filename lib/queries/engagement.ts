import { connectToDatabase } from "@/lib/mongodb";
import User from "@/lib/models/User";
import Like from "@/lib/models/Like";
import Comment from "@/lib/models/Comment";
import CommentLike from "@/lib/models/CommentLike";
import { Types } from "mongoose";

export async function getLikeState(postId: string, userId: string | null) {
  await connectToDatabase();

  const [count, mine] = await Promise.all([
    Like.countDocuments({ post: postId }),
    userId ? Like.exists({ post: postId, user: userId }) : Promise.resolve(null),
  ]);

  return { count, liked: !!mine };
}

type CommentPerson = {
  _id: string;
  name: string;
  username?: string;
  image?: string | null;
};

export type CommentItem = {
  _id: string;
  content: string;
  createdAt: string;
  author?: CommentPerson | null;
  replyTo?: { name: string; username?: string } | null;
  likeCount: number;
  liked: boolean;
  replies: CommentItem[];
};

type RawComment = {
  _id: unknown;
  content: string;
  createdAt: Date;
  parent?: unknown;
  author?: CommentPerson | null;
  replyTo?: { name: string; username?: string } | null;
};

// Top-level comments newest first, each with its replies oldest first
export async function getComments(
  postId: string,
  userId: string | null,
  limit = 300
): Promise<{ comments: CommentItem[]; total: number }> {
  await connectToDatabase();

  const docs = (await Comment.find({ post: postId })
    .populate({ path: "author", model: User, select: "name username image" })
    .populate({ path: "replyTo", model: User, select: "name username" })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean()) as unknown as RawComment[];

  const ids = docs.map((d) => d._id as Types.ObjectId);

  const [counts, mine] = await Promise.all([
    CommentLike.aggregate([
      { $match: { comment: { $in: ids } } },
      { $group: { _id: "$comment", n: { $sum: 1 } } },
    ]),
    userId
      ? CommentLike.find({ comment: { $in: ids }, user: userId }).select("comment").lean()
      : Promise.resolve([]),
  ]);

  const countMap = new Map<string, number>(counts.map((c) => [String(c._id), c.n as number]));
  const likedSet = new Set((mine as { comment: unknown }[]).map((m) => String(m.comment)));

  const toItem = (d: RawComment): CommentItem => {
    const id = String(d._id);
    return {
      _id: id,
      content: d.content,
      createdAt: new Date(d.createdAt).toISOString(),
      author: d.author
        ? {
            _id: String(d.author._id),
            name: d.author.name,
            username: d.author.username,
            image: d.author.image ?? null,
          }
        : null,
      replyTo: d.replyTo ? { name: d.replyTo.name, username: d.replyTo.username } : null,
      likeCount: countMap.get(id) ?? 0,
      liked: likedSet.has(id),
      replies: [],
    };
  };

  const top: CommentItem[] = [];
  const byId = new Map<string, CommentItem>();

  for (const d of docs) {
    const item = toItem(d);
    byId.set(item._id, item);
    if (!d.parent) top.push(item);
  }
  for (const d of docs) {
    if (!d.parent) continue;
    // a reply whose parent was removed is skipped
    byId.get(String(d.parent))?.replies.push(byId.get(String(d._id))!);
  }

  top.reverse(); // newest top-level comment first

  return { comments: top, total: docs.length };
}