import { connectToDatabase } from "@/lib/mongodb";
import Notification from "@/lib/models/Notification";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";

export type NotificationItem = {
  id: string;
  type: "follow" | "like" | "comment" | "new_post";
  text: string;
  createdAt: string;
  read: boolean;
  actorName: string;
  postTitle: string;
  href: string;
};

type Row = {
  _id: unknown;
  type: NotificationItem["type"];
  text?: string;
  createdAt: Date;
  readAt?: Date | null;
  actor?: { name?: string; username?: string } | null;
  post?: { title?: string; slug?: string } | null;
};

// Shared by the bell (unread only) and the /notifications page (everything recent)
export async function getNotificationItems(
  userId: string,
  options: { limit?: number; scope?: "unread" | "all" } = {}
) {
  const { limit = 30, scope = "unread" } = options;

  await connectToDatabase();

  const filter =
    scope === "unread"
      ? { recipient: userId, readAt: null } // also matches older notifications with no readAt
      : { recipient: userId };

  const [rows, unread] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      // names only: no photos, so polling the bell stays light
      .populate({ path: "actor", model: User, select: "name username" })
      .populate({ path: "post", model: Post, select: "title slug" })
      .lean(),
    Notification.countDocuments({ recipient: userId, readAt: null }),
  ]);

  const items: NotificationItem[] = (rows as unknown as Row[])
    // a like, comment or new_post whose post was deleted has nothing to open
    .filter((n) => n.type === "follow" || !!n.post)
    .map((n) => ({
      id: String(n._id),
      type: n.type,
      text: n.text ?? "",
      createdAt: new Date(n.createdAt).toISOString(),
      read: !!n.readAt,
      actorName: n.actor?.name ?? "Someone",
      postTitle: n.post?.title ?? "",
      href:
        n.type === "follow"
          ? n.actor?.username
            ? `/profile/${encodeURIComponent(n.actor.username)}`
            : "/profile"
          : `/blogs/${n.post?.slug}`,
    }));

  return { items, unread };
}