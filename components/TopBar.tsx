"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Bell,
  ChevronDown,
  Users,
  FileText,
  User,
  Heart,
  MessageCircle,
  UserPlus,
  Reply,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession, signOut, signIn } from "next-auth/react";
import Avatar from "@/components/Avatar";
import {
  dismissNotification,
  clearAllNotifications,
} from "@/app/actions/notifications";

type TopbarProfile = {
  name: string;
  image?: string | null;
};

type NotificationItem = {
  id: string;
  type: "follow" | "like" | "comment" | "reply" | "comment_like" | "new_post";
  text: string;
  createdAt: string;
  actorName: string;
  postTitle: string;
  href: string;
};

type SearchResults = {
  communities: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  }[];
  posts: {
    id: string;
    title: string;
    slug: string;
  }[];
  people: {
    id: string;
    name: string;
    username: string;
  }[];
};

const emptyResults: SearchResults = {
  communities: [],
  posts: [],
  people: [],
};

export default function Topbar({
  profile,
}: {
  profile?: TopbarProfile | null;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;

  const [me, setMe] = useState<TopbarProfile | null>(null);
  const [meLoaded, setMeLoaded] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  // Real total from the server (the list itself is capped at the latest 30)
  const [notificationTotal, setNotificationTotal] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load the current user's profile.
  useEffect(() => {
    if (status !== "authenticated") {
      setMe(null);
      setMeLoaded(false);
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (active && data?.user) {
          setMe({
            name: data.user.name ?? user?.name ?? "",
            image: data.user.image ?? null,
          });
        }
      } catch {
        // Keep the session profile as a fallback.
      } finally {
        if (active) setMeLoaded(true);
      }
    };

    void loadProfile();

    window.addEventListener("profile:updated", loadProfile);

    return () => {
      active = false;
      window.removeEventListener("profile:updated", loadProfile);
    };
  }, [status, user?.name]);

  const display: TopbarProfile | null = user
    ? me ??
      profile ?? {
        name: user.name ?? user.email ?? "",
        image: user.image,
      }
    : null;

  const loading =
    status === "loading" ||
    (status === "authenticated" && !meLoaded && !profile);

  // API response: { items: [{ id, type, text, createdAt, actorName, postTitle, href }], total }
  const loadNotifications = useCallback(
    async (showLoading = false) => {
      if (status !== "authenticated") {
        setNotifications([]);
        setNotificationTotal(0);
        setNotificationsError("");
        setNotificationsLoading(false);
        return;
      }

      if (showLoading) setNotificationsLoading(true);

      try {
        const response = await fetch("/api/notifications", {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            setNotifications([]);
            setNotificationTotal(0);
            setNotificationsError("");
            return;
          }

          throw new Error("Could not load notifications.");
        }

        const data = await response.json();

        const items: NotificationItem[] = Array.isArray(data.items)
          ? data.items
              .filter(
                (item: Partial<NotificationItem>) =>
                  typeof item.id === "string" &&
                  typeof item.type === "string"
              )
              .map((item: Partial<NotificationItem>) => ({
                id: item.id!,
                type: item.type as NotificationItem["type"],
                text: item.text ?? "",
                createdAt: item.createdAt ?? "",
                actorName: item.actorName ?? "Someone",
                postTitle: item.postTitle ?? "",
                href: item.href ?? "/",
              }))
          : [];

        setNotifications(items);
        setNotificationTotal(
          typeof data.total === "number" ? data.total : items.length
        );
        setNotificationsError("");
      } catch {
        setNotificationsError("Couldn't load notifications. Please try again.");
      } finally {
        if (showLoading) setNotificationsLoading(false);
      }
    },
    [status]
  );

  // Initial load, refresh every 30 seconds, on tab focus, and after notification events.
  useEffect(() => {
    if (status !== "authenticated") {
      setNotifications([]);
      setNotificationTotal(0);
      setNotificationsError("");
      return;
    }

    void loadNotifications(true);

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 30000);

    const refresh = () => {
      void loadNotifications();
    };

    window.addEventListener("notifications:updated", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("notifications:updated", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [status, loadNotifications]);

  // Badge number: everything waiting for you, not just the 30 shown
  const notificationCount = notificationTotal;

  // Clicking a notification removes it, then opens the page it points to
  const openNotification = (notification: NotificationItem) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== notification.id)
    );
    setNotificationTotal((total) => Math.max(0, total - 1));
    setNotifOpen(false);

    void dismissNotification(notification.id);
    router.push(notification.href || "/");
  };

  // "Clear all" removes every notification
  const clearAll = () => {
    setNotifications([]);
    setNotificationTotal(0);
    void clearAllNotifications();
  };

  // ---------- Search ----------
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const query = search.trim();

  const hasResults =
    results.communities.length +
      results.posts.length +
      results.people.length >
    0;

  useEffect(() => {
    if (query.length < 2) {
      setResults(emptyResults);
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(async () => {
      setSearching(true);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Search failed.");
        }

        const data = await response.json();

        if (!controller.signal.aborted) {
          setResults({
            communities: Array.isArray(data.communities)
              ? data.communities
              : [],
            posts: Array.isArray(data.posts) ? data.posts : [],
            people: Array.isArray(data.people) ? data.people : [],
          });
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults(emptyResults);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearch("");
    setResults(emptyResults);
  };

  // ---------- Dropdown behavior ----------
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationsClick = () => {
    const willOpen = !notifOpen;

    setNotifOpen(willOpen);
    setMenuOpen(false);

    if (willOpen) {
      void loadNotifications(true);
    }
  };

  const handleProfileClick = () => {
    setMenuOpen((previous) => !previous);
    setNotifOpen(false);
  };

  const notificationText = (notification: NotificationItem) => {
    const actorName = notification.actorName || "Someone";

    switch (notification.type) {
      case "follow":
        return `${actorName} started following you.`;

      case "like":
        return `${actorName} liked your post.`;

      case "comment":
        return `${actorName} commented on your post.`;

      case "comment_like":
        return `${actorName} liked your comment.`;

      case "reply":
        return `${actorName} replied to your comment.`;

      case "new_post":
        return `${actorName} published a new post.`;

      default:
        return `${actorName} sent you a notification.`;
    }
  };

  const notificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "follow":
        return <UserPlus size={17} />;

      case "like":
        return <Heart size={17} />;

      case "comment":
        return <MessageCircle size={17} />;

      case "comment_like":
        return <Heart size={17} />;

      case "reply":
        return <Reply size={17} />;

      case "new_post":
        return <FileText size={17} />;

      default:
        return <Bell size={17} />;
    }
  };

  const notificationTime = (date?: string) => {
    if (!date) return "";

    const timestamp = new Date(date).getTime();

    if (!Number.isFinite(timestamp)) return "";

    const elapsed = Math.max(0, Date.now() - timestamp);
    const minutes = Math.floor(elapsed / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);

    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString();
  };

  const sectionTitle =
    "px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500";

  const row =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-800";

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-gray-800 bg-gray-950/90 px-6 py-3 backdrop-blur-xl sm:gap-4 sm:px-6">
      {/* Search */}
      <div className="relative w-full max-w-md" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/80 px-3 py-2.5 text-gray-400 transition focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/10">
          <Search size={17} className="shrink-0" />

          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeSearch();
            }}
            placeholder="Search communities, blogs, people..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {searchOpen && query.length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-800 bg-gray-950 py-2 shadow-2xl">
            {searching && !hasResults ? (
              <p className="px-4 py-4 text-sm text-gray-400">
                Searching...
              </p>
            ) : !hasResults ? (
              <p className="px-4 py-4 text-sm text-gray-400">
                No results for &quot;{query}&quot;
              </p>
            ) : (
              <>
                {results.communities.length > 0 && (
                  <div>
                    <p className={sectionTitle}>Communities</p>

                    {results.communities.map((community) => (
                      <Link
                        key={community.id}
                        href={`/communities/${community.slug}`}
                        onClick={closeSearch}
                        className={row}
                      >
                        {community.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={community.logo}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="h-6 w-6 rounded object-contain"
                          />
                        ) : (
                          <Users
                            size={16}
                            className="shrink-0 text-indigo-400"
                          />
                        )}

                        <span className="truncate">{community.name}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {results.posts.length > 0 && (
                  <div>
                    <p className={sectionTitle}>Blogs</p>

                    {results.posts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blogs/${post.slug}`}
                        onClick={closeSearch}
                        className={row}
                      >
                        <FileText
                          size={16}
                          className="shrink-0 text-gray-400"
                        />
                        <span className="truncate">{post.title}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {results.people.length > 0 && (
                  <div>
                    <p className={sectionTitle}>People</p>

                    {results.people.map((person) => (
                      <Link
                        key={person.id}
                        href={`/profile/${person.username}`}
                        onClick={closeSearch}
                        className={row}
                      >
                        <User
                          size={16}
                          className="shrink-0 text-gray-400"
                        />

                        <span className="truncate">{person.name}</span>

                        <span className="truncate text-xs text-gray-500">
                          @{person.username}
                        </span>
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
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        {/* Notifications */}
        <div className="relative flex items-center" ref={notifRef}>
          <button
            type="button"
            onClick={handleNotificationsClick}
            aria-label={
              notificationCount > 0
                ? `Notifications, ${notificationCount} notifications`
                : "Notifications"
            }
            aria-expanded={notifOpen}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
              notifOpen
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-900 hover:text-white"
            }`}
          >
            <Bell size={20} />

            {display && notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-gray-950 bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </button>

          {notifOpen && (
           <div className="fixed left-3 right-3 top-[72px] z-50 overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl shadow-black/50 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[380px] sm:max-w-[calc(100vw-2rem)]">              {/* Dropdown header */}
              <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {notificationCount > 0
                      ? `${notificationCount} notification${
                          notificationCount === 1 ? "" : "s"
                        }`
                      : "Stay updated with your community"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAll}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-gray-800 hover:text-indigo-200"
                    >
                      Clear all
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void loadNotifications(true)}
                    aria-label="Refresh notifications"
                    disabled={notificationsLoading}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:opacity-50"
                  >
                    {notificationsLoading ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                  </button>
                </div>
              </div>

              {!display ? (
                <div className="px-5 py-9 text-center">
                  <Bell
                    className="mx-auto mb-3 text-gray-600"
                    size={25}
                  />

                  <p className="text-sm font-medium text-gray-200">
                    Sign in to view notifications
                  </p>

                  <button
                    type="button"
                    onClick={() => signIn()}
                    className="mt-4 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
                  >
                    Sign in
                  </button>
                </div>
              ) : notificationsLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center gap-2 px-4 py-9 text-sm text-gray-400">
                  <LoaderCircle size={17} className="animate-spin" />
                  Loading notifications...
                </div>
              ) : notificationsError && notifications.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-gray-400">
                    {notificationsError}
                  </p>

                  <button
                    type="button"
                    onClick={() => void loadNotifications(true)}
                    className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-700"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900 text-gray-500">
                    <Bell size={21} />
                  </div>

                  <p className="text-sm font-medium text-gray-200">
                    You&apos;re all caught up
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    New activity will appear here when someone interacts with
                    you.
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto p-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className="group flex w-full items-start gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition hover:border-gray-800 hover:bg-gray-900"
                    >
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 transition group-hover:bg-indigo-500/20">
                        {notificationIcon(notification.type)}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-5 text-gray-200">
                          {notificationText(notification)}
                        </span>

                        {(notification.type === "comment" ||
                          notification.type === "reply") &&
                          notification.text && (
                            <span className="mt-1 block truncate text-xs italic text-gray-400">
                              &ldquo;{notification.text}&rdquo;
                            </span>
                          )}

                        {notification.postTitle && (
                          <span className="mt-1 block truncate text-xs text-gray-400">
                            {notification.postTitle}
                          </span>
                        )}

                        <span className="mt-1.5 block text-xs text-gray-500">
                          {notificationTime(notification.createdAt)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-800 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setNotifOpen(false);
                    router.push("/notifications");
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-center text-xs font-semibold text-gray-400 transition hover:bg-gray-900 hover:text-white"
                >
                  View all notifications
                  {notificationTotal > notifications.length
                    ? ` (${notificationTotal})`
                    : ""}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-full bg-gray-800" />
            <div className="hidden h-4 w-20 animate-pulse rounded bg-gray-800 sm:block" />
          </div>
        ) : !display ? (
          <button
            type="button"
            onClick={() => signIn()}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            Sign in
          </button>
        ) : (
          <div className="relative flex items-center" ref={menuRef}>
            <button
              type="button"
              onClick={handleProfileClick}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-1.5 text-sm text-white transition hover:bg-gray-900 sm:gap-2.5 sm:pr-2"
            >
              <Avatar
                key={display.image ?? "none"}
                name={display.name}
                image={display.image}
                size={32}
              />

              <span className="hidden max-w-32 truncate sm:inline">
                {display.name}
              </span>

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
                className="absolute right-0 top-full mt-3 w-52 overflow-hidden rounded-xl border border-gray-800 bg-gray-950 py-1.5 text-sm shadow-2xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="block w-full px-4 py-2.5 text-left text-gray-300 transition hover:bg-gray-900 hover:text-white"
                >
                  Profile
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/settings");
                  }}
                  className="block w-full px-4 py-2.5 text-left text-gray-300 transition hover:bg-gray-900 hover:text-white"
                >
                  Settings
                </button>

                <div className="my-1 border-t border-gray-800" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full px-4 py-2.5 text-left text-rose-400 transition hover:bg-rose-500/10"
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