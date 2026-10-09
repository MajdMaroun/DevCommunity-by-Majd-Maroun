import { getLatestPosts } from "@/lib/queries/post";

export default async function BlogsPage() {
  const posts = await getLatestPosts();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-white">
        Latest Blogs
      </h1>

      <p className="mb-8 text-gray-400">
        Discover the latest posts from the DevCommunity.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post._id.toString()}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <div className="mb-3 flex flex-wrap gap-2">
              {post.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                >
                  #{topic}
                </span>
              ))}
            </div>

            <h2 className="mb-3 text-xl font-semibold text-white">
              {post.title}
            </h2>

            <p className="mb-4 text-gray-400">
              {post.content}
            </p>

            <div className="text-sm text-gray-500">
              By {post.author?.toString() ?? "Unknown author"}
              {" · "}
              {post.community?.toString() ?? "Unknown community"}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}