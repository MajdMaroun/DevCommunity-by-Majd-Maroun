"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import FollowButton from "@/components/FollowButton";

type Person = {
  _id: string;
  name: string;
  username: string;
  title?: string;
  image?: string | null;
  bio?: string;
  iFollow: boolean; // I follow them
  followedBy: boolean; // they follow me
  isMe: boolean; // this row is me
};

interface ConnectionsListProps {
  username: string;
  type: "followers" | "following";
}

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

const card = "rounded-xl border border-slate-800 bg-[#0f1629]";

function SkeletonRow() {
  return (
    <div className={`${card} flex items-center gap-3 p-3 sm:gap-4 sm:p-4`}>
      <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-800" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-32 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-24 animate-pulse rounded bg-slate-800/70" />
      </div>
      <div className="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-slate-800" />
    </div>
  );
}

export default function ConnectionsList({ username, type }: ConnectionsListProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");

    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/connections?type=${type}`,
        { cache: "no-store" }
      );

      if (!response.ok) throw new Error("Failed to load people");

      const data = await response.json();
      setPeople(data.people ?? []);
      setStatus("ready");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }, [username, type]);

  useEffect(() => {
    setQuery("");
    void load();
  }, [load]);

  // Client-side filter by name or @username
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people;

    return people.filter(
      (person) =>
        person.name.toLowerCase().includes(q) ||
        person.username.toLowerCase().includes(q)
    );
  }, [people, query]);

  if (status === "loading") {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`${card} px-6 py-10 text-center`}>
        <p className="text-sm font-medium text-slate-200">Couldn&apos;t load this list.</p>
        <p className="mt-1 text-xs text-slate-500">Check your connection and try again.</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (people.length === 0) {
    return (
      <div className={`${card} flex flex-col items-center px-6 py-14 text-center`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
          <Users className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-white">
          {type === "followers" ? "No followers yet" : "Not following anyone yet"}
        </h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">
          {type === "followers"
            ? "When people follow this profile, they will show up here."
            : "Profiles this person follows will show up here."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {people.length} {people.length === 1 ? "person" : "people"}
        </p>
      </div>

      {/* A search box is only useful once the list is long enough to need one */}
      {people.length > 5 && (
        <label className="mb-3 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2.5 text-slate-400 focus-within:border-indigo-500/60">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or username"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
      )}

      {visible.length === 0 ? (
        <p className={`${card} px-6 py-10 text-center text-sm text-slate-400`}>
          No one matches &ldquo;{query.trim()}&rdquo;.
        </p>
      ) : (
        <ul className="space-y-3">
          {visible.map((person) => (
            <li
              key={person._id}
              className={`${card} flex items-center gap-3 p-3 transition hover:border-slate-700 sm:gap-4 sm:p-4`}
            >
              <Link
                href={`/profile/${encodeURIComponent(person.username)}`}
                className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4"
              >
                {person.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white">
                    {initialsOf(person.name)}
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white">
                      {person.name}
                    </span>
                    {person.isMe && (
                      <span className="shrink-0 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                        You
                      </span>
                    )}
                  </span>

                  <span className="block truncate text-xs text-slate-400">
                    @{person.username}
                  </span>

                  {(person.title || person.bio) && (
                    <span className="mt-0.5 hidden truncate text-xs text-slate-500 sm:block">
                      {person.title || person.bio}
                    </span>
                  )}
                </span>
              </Link>

              {/* No follow button on my own row */}
              {!person.isMe && (
                <div className="shrink-0">
                  <FollowButton
                    // key forces a fresh button if the list reloads with new follow state
                    key={`${person._id}-${person.iFollow}-${person.followedBy}`}
                    userId={person._id}
                    initialFollowing={person.iFollow}
                    followedBy={person.followedBy}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}