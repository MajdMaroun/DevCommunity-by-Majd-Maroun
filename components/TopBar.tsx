"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Bell, ChevronDown, Users, FileText, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import Avatar from "@/components/Avatar";

type TopbarProfile = { name: string; image?: string | null };

type SearchResults = {
  communities: { id: string; name: string; slug: string; logo: string | null }[];
  posts: { id: string; title: string; slug: string }[];
  people: { id: string; name: string; username: string }[];
};

const emptyResults: SearchResults = { communities: [], posts: [], people: [] };

// The Auth.js session decides IF someone is signed in.
// /api/auth/me supplies the fresh name and photo from the database.
export default function Topbar({ profile }: { profile?: TopbarProfile | null }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [me, setMe] = useState<TopbarProfile | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);

  // Load the fresh profile only while signed in; clear it on logout
  useEffect(() => {
    if (status !== "authenticated") {
      setMe(null);
      setMeLoaded(false);
      return;
    }

    const load = () =>
      fetch("/api/auth/me", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.user) setMe({ name: d.user.name, image: d.user.image ?? null });
        })
        .catch(() => {})
        .finally(() => setMeLoaded(true));

    load();
    window.addEventListener("profile:updated", load);
    return () => window.removeEventListener("profile:updated", load);
  }, [status]);

  // No session means no profile, whatever /api/auth/me or a leftover cookie says
  const display: TopbarProfile | null = user
    ? me ?? profile ?? { name: user.name ?? user.email ?? "", image: user.image }
    : null;

  // Wait for the session, and for the DB profile, so the Google photo never flashes
  const loading =
    status === "loading" || (status === "authenticated" && !meLoaded && !profile);

  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ---------- search ----------
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const query = search.trim();
  const hasResults =
    results.communities.length + results.posts.length + results.people.length > 0;

  // Debounced search; older requests are cancelled so results never arrive out of order
  useEffect(() => {
    if (query.length < 2) {
      setResults(emptyResults);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data: SearchResults = await res.json();
        setResults(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setResults(emptyResults);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch("");
    setResults(emptyResults);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationsClick = () => {
    setNotifOpen((prev) => !prev);
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    setMenuOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const sectionTitle = "px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500";
  const row =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-gray-800";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-800 bg-gray-950/80 px-6 py-3 backdrop-blur">
      {/* Search */}
      <div className="relative w-full max-w-md" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-gray-400 focus-within:border-gray-700">
          <Search size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") closeSearch();
            }}
            placeholder="Search communities, blogs, people..."
            className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
          />
        </div>

        {searchOpen && query.length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-800 bg-gray-900 pb-2 shadow-xl">
            {searching && !hasResults ? (
              <p className="px-4 py-4 text-sm text-gray-400">Searching...</p>
            ) : !hasResults ? (
              <p className="px-4 py-4 text-sm text-gray-400">
                No results for &quot;{query}&quot;
              </p>
            ) : (
              <>
                {results.communities.length > 0 && (
                  <div>
                    <p className={sectionTitle}>Communities</p>
                    {results.communities.map((c) => (
                      <Link
                        key={c.id}
                        href={`/communities/${c.slug}`}
                        onClick={closeSearch}
                        className={row}
                      >
                        {c.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.logo}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 rounded object-contain"
                          />
                        ) : (
                          <Users size={16} className="text-blue-400" />
                        )}
                        <span className="truncate">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {results.posts.length > 0 && (
                  <div>
                    <p className={sectionTitle}>Blogs</p>
                    {results.posts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/blogs/${p.slug}`}
                        onClick={closeSearch}
                        className={row}
                      >
                        <FileText size={16} className="shrink-0 text-gray-400" />
                        <span className="truncate">{p.title}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {results.people.length > 0 && (
                  <div>
                    <p className={sectionTitle}>People</p>
                    {results.people.map((u) => (
                      <Link
                        key={u.id}
                        href={`/profile/${u.username}`}
                        onClick={closeSearch}
                        className={row}
                      >
                        <User size={16} className="shrink-0 text-gray-400" />
                        <span className="truncate">{u.name}</span>
                        <span className="text-xs text-gray-500">@{u.username}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative flex items-center" ref={notifRef}>
          <button
            onClick={handleNotificationsClick}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            className="relative flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-white"
          >
            <Bell size={20} />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-3 w-72 rounded-lg border border-gray-800 bg-gray-900 p-2 shadow-xl">
              <p className="px-3 py-2 text-xs font-semibold uppercase text-gray-500">
                Notifications
              </p>
              <div className="px-3 py-4 text-sm text-gray-400">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        {loading ? (
          // Skeleton while the session / profile loads
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-800" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
          </div>
        ) : !display ? (
          <button
            onClick={() => signIn()}
            className="rounded-lg bg-indigo-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-400"
          >
            Sign in
          </button>
        ) : (
          <div className="relative flex items-center" ref={menuRef}>
            <button
              onClick={handleProfileClick}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 text-sm text-white"
            >
              {/* key remounts the avatar when the image changes */}
              <Avatar
                key={display.image ?? "none"}
                name={display.name}
                image={display.image}
                size={32}
              />

              <span className="hidden sm:inline">{display.name}</span>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-3 w-48 rounded-lg border border-gray-800 bg-gray-900 py-1 text-sm shadow-xl"
              >
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Profile
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Settings
                </button>
                <button
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}