import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import ConnectionsList from "@/components/ConnectionsList";
import { getUserByUsername } from "@/lib/queries/users";

type Props = {
params: Promise<{ username: string }>;
searchParams: Promise<{ type?: string }>;
};

export default function ConnectionsPage(props: Props) {
return (
<Suspense fallback={<ConnectionsLoading />}>
<ConnectionsContent {...props} /> </Suspense>
);
}

async function ConnectionsContent({
params,
searchParams,
}: Props) {
const [{ username: rawUsername }, { type }] = await Promise.all([
params,
searchParams,
]);

let username = rawUsername;

try {
username = decodeURIComponent(rawUsername);
} catch {
// Keep the original value if decoding fails.
}

const user = await getUserByUsername(username);

if (!user) notFound();

const connectionType =
type === "following" ? "following" : "followers";

const base = `/profile/${encodeURIComponent(username)}`;

const initials = user.name
.split(" ")
.filter(Boolean)
.map((part) => part[0])
.join("")
.slice(0, 2)
.toUpperCase();

const tabs = [
{ key: "followers", label: "Followers" },
{ key: "following", label: "Following" },
] as const;

return ( <main className="mx-auto w-full max-w-2xl px-4 py-6 text-white sm:px-6 sm:py-10"> <Link
     href={base}
     className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-blue-300"
   > <ArrowLeft className="h-4 w-4" />
Back to profile </Link>

  <header className="mb-6 flex items-center gap-3 sm:gap-4">
    {user.image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.image}
        alt=""
        referrerPolicy="no-referrer"
        className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
      />
    ) : (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-base font-semibold sm:h-14 sm:w-14 sm:text-lg">
        {initials || "U"}
      </span>
    )}

    <div className="min-w-0">
      <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
        {user.name}
      </h1>
      <p className="truncate text-sm text-slate-400">
        @{user.username ?? username}
      </p>
    </div>
  </header>

  <nav
    aria-label="Connections"
    className="mb-5 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-900/60 p-1"
  >
    {tabs.map((tab) => {
      const active = connectionType === tab.key;

      return (
        <Link
          key={tab.key}
          href={`${base}/connections?type=${tab.key}`}
          replace
          aria-current={active ? "page" : undefined}
          className={`rounded-lg py-2 text-center text-sm font-medium transition ${
            active
              ? "bg-indigo-500 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          {tab.label}
        </Link>
      );
    })}
  </nav>

  <ConnectionsList username={username} type={connectionType} />
</main>

);
}

function ConnectionsLoading() {
return ( <main className="mx-auto w-full max-w-2xl animate-pulse px-4 py-6 text-white sm:px-6 sm:py-10"> <div className="mb-5 h-5 w-36 rounded bg-slate-800" />

  <div className="mb-6 flex items-center gap-4">
    <div className="h-14 w-14 rounded-full bg-slate-800" />
    <div className="space-y-2">
      <div className="h-5 w-36 rounded bg-slate-800" />
      <div className="h-4 w-24 rounded bg-slate-800" />
    </div>
  </div>

  <div className="mb-5 h-11 rounded-xl bg-slate-800" />
  <div className="space-y-3">
    <div className="h-16 rounded-xl bg-slate-800" />
    <div className="h-16 rounded-xl bg-slate-800" />
    <div className="h-16 rounded-xl bg-slate-800" />
  </div>
</main>

);
}
