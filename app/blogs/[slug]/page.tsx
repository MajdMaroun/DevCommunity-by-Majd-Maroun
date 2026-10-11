import Link from "next/link";
import { notFound } from "next/navigation";
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

  // Drafts are only visible to their author
  if (!post.published) {
    const me = await getCurrentUser();
    if (!me || me._id !== post.author?._id) notFound();
  }

  const author = post.author;

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
       className="mb-6 aspect-[2/1] w-full rounded-xl object-cover"
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

        {!post.published && (
          <span className="rounded bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-300">
            Draft
          </span>
        )}
      </div>

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

      {/* Plain text with line breaks preserved. If you store Markdown,
          render it with react-markdown instead. */}
      <div className="mt-8 whitespace-pre-wrap leading-relaxed text-gray-200">
        {post.content}
      </div>
    </article>
  );
}