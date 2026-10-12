import Link from "next/link";
import { getPublishedPosts } from "@/lib/queries/post";

interface BlogPageSearchParams {
  topic?: string;
}

interface BlogAuthor {
  username?: string;
  name?: string;
}

interface BlogCommunity {
  slug: string;
  name: string;
}

interface BlogPost {
  _id: string;
  slug: string;
  cover?: string;
  title: string;
  content: string;
  topics: string[];
  author?: BlogAuthor;
  community?: BlogCommunity;
  createdAt: string | Date;
}

export const dynamic = "force-dynamic";

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<BlogPageSearchParams>;
}) {
  const { topic } = await searchParams;
  const posts: BlogPost[] = await getPublishedPosts(topic);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-white">
        {topic ? `Posts about ${topic}` : "Latest Blogs"}
      </h1>

      <p className="mb-8 text-gray-400">
        {topic ? (
          <>
            Showing posts tagged #{topic}.{" "}
            <Link href="/blogs" className="text-blue-400 hover:text-blue-300">
              Clear filter
            </Link>
          </>
        ) : (
          "Discover the latest posts from the DevCommunity."
        )}
      </p>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-gray-800 bg-gray-900 p-6 text-sm text-gray-400">
          {topic ? `No posts about ${topic} yet.` : "No posts yet."}
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post._id}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-900"
            >
              {post.cover && (
                <Link href={`/blogs/${post.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover}
                    alt=""
                    className="aspect-[2/1] w-full object-cover"
                  />
                </Link>
              )}

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap gap-2">
                  {post.topics.map((t) => (
                    <Link
                      key={t}
                      href={`/blogs?topic=${encodeURIComponent(t)}`}
                      className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      #{t}
                    </Link>
                  ))}
                </div>

                <Link href={`/blogs/${post.slug}`}>
                  <h2 className="mb-3 text-xl font-semibold text-white hover:text-blue-300">
                    {post.title}
                  </h2>
                </Link>

                <p className="mb-4 line-clamp-3 text-gray-400">{post.content}</p>

                <div className="mt-auto text-sm text-gray-500">
                  By{" "}
                  {post.author?.username ? (
                    <Link
                      href={`/profile/${post.author.username}`}
                      className="hover:text-white"
                    >
                      {post.author.name}
                    </Link>
                  ) : (
                    (post.author?.name ?? "Unknown author")
                  )}
                  {" · "}
                  {post.community ? (
                    <Link
                      href={`/communities/${post.community.slug}`}
                      className="hover:text-white"
                    >
                      {post.community.name}
                    </Link>
                  ) : (
                    "No community"
                  )}
                  {" · "}
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}