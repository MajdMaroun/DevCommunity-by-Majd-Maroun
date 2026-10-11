// app/communities/page.tsx
import { auth } from "@/auth";
import CommunityCard from "@/components/CommunityCard";
// Must return { id, slug, name, description, logo, topics, memberCount, joined }
// per community: the same shape getFeaturedCommunities(userId) returns.
import { getAllCommunities } from "@/lib/queries/communities";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const communities = await getAllCommunities(userId);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold text-white">Communities</h1>

      <p className="mb-8 text-gray-400">
        Explore developer communities and find topics you are interested in.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {communities.map((c) => (
          <CommunityCard key={c.id} community={c} signedIn={!!userId} />
        ))}
      </div>
    </main>
  );
}