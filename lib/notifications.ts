// Helpers other actions call to create or remove notifications.
// A notification failing must never break the like, comment or follow itself,
// so every helper swallows (and logs) its own errors.
import "server-only";
import { connectToDatabase } from "@/lib/mongodb";
import Notification, { type NotificationType } from "@/lib/models/Notification";
import Follow from "@/lib/models/Follow";

type NotifyInput = {
  recipient: string;
  actor: string;
  type: NotificationType;
  post?: string;
  comment?: string;
  text?: string;
  dedupe?: boolean; // skip if the same notification already exists
};

export async function notify(input: NotifyInput) {
  try {
    if (input.recipient === input.actor) return; // never notify yourself

    await connectToDatabase();

    if (input.dedupe) {
      const exists = await Notification.exists({
        recipient: input.recipient,
        actor: input.actor,
        type: input.type,
        ...(input.post ? { post: input.post } : {}),
      });
      if (exists) return;
    }

    await Notification.create({
      recipient: input.recipient,
      actor: input.actor,
      type: input.type,
      post: input.post,
      comment: input.comment,
      text: input.text,
    });
  } catch (error) {
    console.error("notify failed:", error);
  }
}

// Remove notifications that no longer apply (unlike, unfollow, deleted comment or post...)
export async function unnotify(filter: {
  recipient?: string;
  actor?: string;
  type?: NotificationType;
  post?: string;
  comment?: string;
}) {
  try {
    await connectToDatabase();
    await Notification.deleteMany(filter);
  } catch (error) {
    console.error("unnotify failed:", error);
  }
}

// "<author> published a new post" for everyone who follows the author
export async function notifyFollowers(authorId: string, postId: string) {
  try {
    await connectToDatabase();

    // Already announced (for example, a post that is un-published and published again)
    if (await Notification.exists({ type: "new_post", post: postId })) return;

    const follows = await Follow.find({ following: authorId })
      .select("follower")
      .lean();
    if (follows.length === 0) return;

    await Notification.insertMany(
      follows.map((f) => ({
        recipient: f.follower,
        actor: authorId,
        type: "new_post" as const,
        post: postId,
      }))
    );
  } catch (error) {
    console.error("notifyFollowers failed:", error);
  }
}