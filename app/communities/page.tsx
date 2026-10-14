import Link from "next/link";
import { auth } from "@/auth";
import CommunityCard from "@/components/CommunityCard";
import { getAllCommunities } from "@/lib/queries/communities";
import { ArrowRight, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const signedIn = !!userId;
  const communities = await getAllCommunities(userId);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 flex flex-col gap-5 border-b border-slate-800 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            <Users className="h-4 w-4" />
            Discover
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Developer communities
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Find your people, join conversations, and share knowledge around
            the technologies and topics you care about.
          </p>
        </div>

        {!signedIn && (
          <Link
            href="/login"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            Sign in to join
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">All communities</h2>

        <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-400">
          {communities.length}{" "}
          {communities.length === 1 ? "community" : "communities"}
        </span>
      </div>

      {communities.length === 0 ? (
        <section className="rounded-xl border border-dashed border-slate-700 bg-[#0f1629] px-6 py-14 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
            <Users className="h-6 w-6" />
          </span>

          <h2 className="mt-4 text-lg font-semibold text-white">
            No communities yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            Communities will appear here once they become available.
          </p>
        </section>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              signedIn={signedIn}
            />
          ))}
        </div>
      )}
    </main>
  );
}