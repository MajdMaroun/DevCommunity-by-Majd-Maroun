import Link from "next/link";
import { getCommunities } from "@/lib/queries/communities";
import { getLatestPosts } from "@/lib/queries/post";

export default async function Home() {
  const communities = await getCommunities();
  const posts = await getLatestPosts();

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <h1 className="mb-6 text-5xl font-bold">
            Welcome to DevCommunity
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-400">
            Discover developer communities, share knowledge, and connect with
            developers from around the world.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/communities"
              className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 hover:bg-gray-200"
            >
              Explore Communities
            </Link>

            <Link
              href="/blogs"
              className="rounded-lg border border-gray-700 px-6 py-3 font-semibold text-white hover:bg-gray-900"
            >
              Read Blogs
            </Link>
          </div>
        </div>
      </section>

      {/* Communities */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Popular Communities</h2>
            <p className="mt-2 text-gray-400">
              Find communities that match your interests.
            </p>
          </div>

          <Link
            href="/communities"
            className="text-gray-300 hover:text-white"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {communities.slice(0, 3).map((community) => (
            <Link
              key={community._id.toString()}
              href={`/communities/${community.slug}`}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-600"
            >
              <h3 className="mb-2 text-xl font-semibold">
                {community.name}
              </h3>

              <p className="mb-4 text-gray-400">
                {community.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {community.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Blogs */}
      <section className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Latest Blogs</h2>
              <p className="mt-2 text-gray-400">
                Read the latest posts from the community.
              </p>
            </div>

            <Link
              href="/blogs"
              className="text-gray-300 hover:text-white"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
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

                <h3 className="mb-3 text-xl font-semibold">
                  {post.title}
                </h3>

                <p className="mb-4 text-gray-400">
                  {post.content}
                </p>

                <p className="text-sm text-gray-500">
                  By {post.author?.toString() ?? "Unknown author"}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}