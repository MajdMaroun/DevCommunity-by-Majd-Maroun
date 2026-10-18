import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ConnectionsList from "@/components/ConnectionsList";
import { getUserByUsername } from "@/lib/queries/users";

export default async function ConnectionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { username: rawUsername } = await params;
  const { type } = await searchParams;

  // Next.js hands over the URL-encoded value ("lichaa%20mar"), so decode it first
  let username = rawUsername;
  try {
    username = decodeURIComponent(rawUsername);
  } catch {
    // keep the raw value if it is not valid encoding
  }

  const user = await getUserByUsername(username);
  if (!user) notFound();

  const connectionType = type === "following" ? "following" : "followers";
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

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 text-white sm:px-6 sm:py-10">
      <Link
        href={base}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>

      {/* Whose connections these are */}
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
          <p className="truncate text-sm text-slate-400">@{user.username ?? username}</p>
        </div>
      </header>

      {/* Followers / Following switch */}
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