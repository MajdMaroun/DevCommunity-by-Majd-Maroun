import Link from "next/link";
import { Users } from "lucide-react";
import JoinButton from "@/components/JoinButton";

export type CommunityCardData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo?: string;
  topics: string[];
  memberCount: number;
  joined: boolean;
};

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}K`;
  return String(n);
}

// Server component: no localStorage, no local state.
// Membership + count come from the database, same as the main page.
export default function CommunityCard({
  community: c,
  signedIn,
}: {
  community: CommunityCardData;
  signedIn: boolean;
}) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-[#0f1629] p-4">
      <Link href={`/communities/${c.slug}`} className="block">
        {c.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.logo}
            alt=""
            referrerPolicy="no-referrer"
            className="h-11 w-11 rounded-xl object-contain"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-lg font-bold text-blue-300">
            {c.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h3 className="mt-3 text-sm font-semibold text-white">{c.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-[2rem] text-xs text-slate-400">
          {c.description}
        </p>
      </Link>

      <div className="mt-3 flex flex-wrap gap-1">
        {c.topics.slice(0, 2).map((t) => (
          <span
            key={t}
            className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300"
          >
            #{t}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-3">
        <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="h-3.5 w-3.5" />
          {formatCount(c.memberCount)} members
        </p>
        <JoinButton communityId={c.id} joined={c.joined} signedIn={signedIn} />
      </div>
    </div>
  );
}