import Link from "next/link";
import { getComments, type CommentItem } from "@/lib/queries/engagement";
import { CommentForm, CommentActions } from "@/components/CommentControls";

function Avatar({
  name,
  image,
  size,
}: {
  name: string;
  image?: string | null;
  size: "md" | "sm";
}) {
  const box = size === "md" ? "h-8 w-8" : "h-7 w-7";

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className={`${box} shrink-0 rounded-full object-cover`}
      />
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`${box} flex shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white`}
    >
      {initials}
    </span>
  );
}

function CommentBlock({
  c,
  isReply,
  postId,
  currentUserId,
  postAuthorId,
}: {
  c: CommentItem;
  isReply: boolean;
  postId: string;
  currentUserId: string | null;
  postAuthorId: string | null;
}) {
  const name = c.author?.name ?? "Deleted user";
  const canDelete =
    !!currentUserId && (currentUserId === c.author?._id || currentUserId === postAuthorId);

  return (
    <div id={`comment-${c._id}`} className="flex scroll-mt-24 gap-3">
      <Avatar name={name} image={c.author?.image} size={isReply ? "sm" : "md"} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {c.author?.username ? (
            <Link
              href={`/profile/${encodeURIComponent(c.author.username)}`}
              className="font-medium text-white hover:text-blue-300"
            >
              {name}
            </Link>
          ) : (
            <span className="font-medium text-white">{name}</span>
          )}
          <span className="text-xs text-gray-500" suppressHydrationWarning>
            {new Date(c.createdAt).toLocaleString()}
          </span>
        </div>

        {isReply && c.replyTo && (
          <p className="mt-0.5 text-xs text-gray-500">
            replying to <span className="text-gray-400">{c.replyTo.name}</span>
          </p>
        )}

        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-300">
          {c.content}
        </p>

        <CommentActions
          postId={postId}
          commentId={c._id}
          initialLiked={c.liked}
          initialLikeCount={c.likeCount}
          signedIn={!!currentUserId}
          canDelete={canDelete}
          hasReplies={c.replies.length > 0}
        />

        {c.replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l border-gray-800 pl-4">
            {c.replies.map((reply) => (
              <CommentBlock
                key={reply._id}
                c={reply}
                isReply
                postId={postId}
                currentUserId={currentUserId}
                postAuthorId={postAuthorId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default async function CommentSection({
  postId,
  currentUserId,
  postAuthorId,
}: {
  postId: string;
  currentUserId: string | null;
  postAuthorId: string | null;
}) {
  const { comments, total } = await getComments(postId, currentUserId);

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">
        Comments <span className="text-gray-500">({total})</span>
      </h2>

      {currentUserId ? (
        <CommentForm postId={postId} />
      ) : (
        <p className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm text-gray-400">
          <Link href="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <div className="mt-6 space-y-6">
        {comments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet. Be the first.</p>
        )}

        {comments.map((c) => (
          <CommentBlock
            key={c._id}
            c={c}
            isReply={false}
            postId={postId}
            currentUserId={currentUserId}
            postAuthorId={postAuthorId}
          />
        ))}
      </div>
    </section>
  );
}