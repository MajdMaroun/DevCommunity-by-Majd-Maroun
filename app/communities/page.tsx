import { getCommunities } from "@/lib/queries/communities";

export default async function CommunitiesPage() {
  const communities = await getCommunities();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-white">
        Communities
      </h1>

      <p className="mb-8 text-gray-400">
        Explore developer communities and find topics you are interested in.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {communities.map((community) => (
          <div
            key={community._id.toString()}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <h2 className="mb-2 text-xl font-semibold text-white">
              {community.name}
            </h2>

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
          </div>
        ))}
      </div>
    </main>
  );
}