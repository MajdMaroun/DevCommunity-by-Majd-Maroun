import Link from "next/link";
import { getComments } from "@/lib/queries/engagement";
import { CommentForm, DeleteCommentButton } from "@/components/CommentControls";

function Avatar({ name, image }: { name: string; image?: string | null }) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className="h-8 w-8 shrink-0 rounded-full object-cover"
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
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
      {initials}
    </span>
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
  const comments = await getComments(postId);

  return (
    <section className="mt-10 border-t border-gray-800 pt-8">
      <h2 className="mb-4 text-lg font-semibold">
        Comments <span className="text-gray-500">({comments.length})</span>
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

      <div className="mt-6 space-y-5">
        {comments.length === 0 && (
          <p className="text-sm text-gray-500">No comments yet. Be the first.</p>
        )}

        {comments.map((c) => {
          const name = c.author?.name ?? "Deleted user";
          const canDelete =
            !!currentUserId &&
            (currentUserId === c.author?._id || currentUserId === postAuthorId);

          return (
            <div key={c._id} className="flex gap-3">
              <Avatar name={name} image={c.author?.image} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {c.author?.username ? (
                    <Link
                      href={`/profile/${c.author.username}`}
                      className="font-medium text-white hover:text-blue-300"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="font-medium text-white">{name}</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                  {canDelete && <DeleteCommentButton commentId={c._id} />}
                </div>

                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-300">
                  {c.content}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}