import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/auth";
import CommunityCard from "@/components/CommunityCard";
import Reveal from "@/components/Reveal";
import { getAllCommunities } from "@/lib/queries/communities";
import { ArrowRight, Users } from "lucide-react";

function CommunitiesLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mb-8 border-b border-slate-800 pb-7">
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-slate-800" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded bg-slate-800" />
        <div className="mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-900" />
      </div>

      <div className="mb-5 h-6 w-40 animate-pulse rounded bg-slate-800" />

      <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{ animationDelay: `${index * 80}ms` }}
            className="h-48 animate-pulse rounded-xl border border-slate-800 bg-[#0f1629]"
          />
        ))}
      </div>
    </main>
  );
}

async function CommunitiesContent() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const signedIn = !!userId;

  const communities = await getAllCommunities(userId);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <Reveal>
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-800 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="group mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-400 transition-all duration-500 hover:tracking-[0.26em]">
              <Users className="h-4 w-4 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-12 motion-reduce:transform-none" />
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
              className="group inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-500/50 hover:bg-slate-800 hover:text-white hover:shadow-lg hover:shadow-blue-950/30 active:translate-y-0 active:scale-95 sm:w-auto motion-reduce:transform-none"
            >
              Sign in to join
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1.5 motion-reduce:transform-none" />
            </Link>
          )}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">All communities</h2>

          <span className="rounded-md bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-400 transition-all duration-200 hover:scale-105 hover:bg-blue-500/20 hover:text-blue-200 motion-reduce:transform-none">
            {communities.length}{" "}
            {communities.length === 1 ? "community" : "communities"}
          </span>
        </div>
      </Reveal>

      {communities.length === 0 ? (
        <Reveal delay={120}>
          <section className="group rounded-xl border border-dashed border-slate-700 bg-[#0f1629] px-4 py-10 text-center transition-all duration-300 hover:border-blue-500/40 hover:bg-[#121b33] sm:px-6 sm:py-14">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-blue-500/25 motion-reduce:transform-none">
              <Users className="h-6 w-6" />
            </span>

            <h2 className="mt-4 text-lg font-semibold text-white">
              No communities yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Communities will appear here once they become available.
            </p>
          </section>
        </Reveal>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {communities.map((community, i) => (
            <Reveal
              key={community.id}
              delay={Math.min(i, 8) * 60}
              className="min-w-0"
            >
              <div className="h-full transition-all duration-300 ease-out hover:-translate-y-1.5 hover:drop-shadow-xl active:scale-[0.99] motion-reduce:transform-none">
                <CommunityCard community={community} signedIn={signedIn} />
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </main>
  );
}

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<CommunitiesLoading />}>
      <CommunitiesContent />
    </Suspense>
  );
}