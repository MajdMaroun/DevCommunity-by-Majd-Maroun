import Link from "next/link";
import { notFound } from "next/navigation";
import PostActions from "@/components/PostActions";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import { getLikeState } from "@/lib/queries/engagement";
import { getPostBySlug } from "@/lib/queries/post";
import { getCurrentUser } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const me = await getCurrentUser();
  const isAuthor = !!me && me._id === post.author?._id;

  // Drafts are only visible to their author
  if (!post.published && !isAuthor) notFound();

  const author = post.author;
  const like = await getLikeState(post._id, me?._id ?? null);

  return (
    <article className="mx-auto max-w-3xl px-6 py-10 text-white">
      {post.community && (
        <Link
          href={`/communities/${post.community.slug}`}
          className="text-xs font-medium text-blue-400 hover:text-blue-300"
        >
          {post.community.name}
        </Link>
      )}

      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover}
          alt=""
          className="mb-6 mt-3 aspect-[2/1] w-full rounded-xl object-cover"
        />
      )}

      <h1 className="mt-2 text-4xl font-bold tracking-tight">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
        {author?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800" />
        )}

        {author?.username ? (
          <Link href={`/profile/${author.username}`} className="hover:text-white">
            {author.name}
          </Link>
        ) : (
          <span>{author?.name ?? "Unknown"}</span>
        )}

        <span>·</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>

        {/* Shown only after the post's writing has been edited */}
        {"editedAt" in post && typeof post.editedAt === "string" && (
          <>
            <span>·</span>
            <span title={new Date(post.editedAt).toLocaleString()}>
              Edited {new Date(post.editedAt).toLocaleDateString()}
            </span>
          </>
        )}

        {!post.published && (
          <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300">
            Draft
          </span>
        )}
      </div>

      {/* Edit / Publish / Delete, only for the author */}
      {isAuthor && (
        <PostActions
          postId={post._id}
          slug={post.slug}
          published={post.published}
          redirectTo="/profile"
        />
      )}

      {post.topics?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.topics.map((t) => (
            <Link
              key={t}
              href={`/blogs?topic=${encodeURIComponent(t)}`}
              className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 whitespace-pre-wrap leading-relaxed text-gray-200">
        {post.content}
      </div>

      {/* Likes and comments are for published posts only */}
      {post.published && (
        <>
          <div className="mt-8 flex items-center gap-4 border-t border-gray-800 pt-6">
            <LikeButton
              postId={post._id}
              initialLiked={like.liked}
              initialCount={like.count}
              signedIn={!!me}
            />
          </div>

          <CommentSection
            postId={post._id}
            currentUserId={me?._id ?? null}
            postAuthorId={post.author?._id ?? null}
          />
        </>
      )}
    </article>
  );
}