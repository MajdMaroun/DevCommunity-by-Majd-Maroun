"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, FileText, Heart, MessageCircle, Reply, UserPlus, X } from "lucide-react";
import {
  dismissNotification,
  clearAllNotifications,
  deleteNotification,
  deleteAllNotifications,
} from "@/app/actions/notifications";
import type { NotificationItem } from "@/lib/queries/notifications";

type View = "unread" | "recent";
type Filter = "all" | "follow" | "like" | "comment" | "new_post";

// "Likes" also covers comment likes, and "Comments" also covers replies
const GROUPS: Record<Exclude<Filter, "all">, NotificationItem["type"][]> = {
  follow: ["follow"],
  like: ["like", "comment_like"],
  comment: ["comment", "reply"],
  new_post: ["new_post"],
};

const matches = (n: NotificationItem, filter: Filter) =>
  filter === "all" || GROUPS[filter].includes(n.type);

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "follow", label: "Follows" },
  { key: "like", label: "Likes" },
  { key: "comment", label: "Comments" },
  { key: "new_post", label: "New posts" },
];

function Icon({ type }: { type: NotificationItem["type"] }) {
  const cls = "h-[18px] w-[18px]";
  if (type === "follow") return <UserPlus className={cls} />;
  if (type === "like" || type === "comment_like") return <Heart className={cls} />;
  if (type === "reply") return <Reply className={cls} />;
  if (type === "comment") return <MessageCircle className={cls} />;
  return <FileText className={cls} />;
}

function Message({ n }: { n: NotificationItem }) {
  const who = <span className="font-semibold text-white">{n.actorName}</span>;

  if (n.type === "follow") return <>{who} started following you</>;
  if (n.type === "like") return <>{who} liked your post &ldquo;{n.postTitle}&rdquo;</>;
  if (n.type === "comment_like") return <>{who} liked your comment on &ldquo;{n.postTitle}&rdquo;</>;
  if (n.type === "comment" || n.type === "reply") {
    return (
      <>
        {who} {n.type === "reply" ? "replied to your comment on" : "commented on"} &ldquo;{n.postTitle}&rdquo;
        {n.text && <span className="block truncate text-gray-400">{n.text}</span>}
      </>
    );
  }
  return <>{who} published &ldquo;{n.postTitle}&rdquo;</>;
}

function timeAgo(iso: string) {
  const minutes = Math.floor(Math.max(0, Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsList({
  initialItems,
}: {
  initialItems: NotificationItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const unreadCount = items.filter((n) => !n.read).length;

  // Start on Unread if there is something new, otherwise show the history
  const [view, setView] = useState<View>(unreadCount > 0 ? "unread" : "recent");
  const [filter, setFilter] = useState<Filter>("all");

  // Tell the bell in the topbar to refresh its badge once the server has saved the change
  const syncBell = () => window.dispatchEvent(new Event("notifications:updated"));

  // Opening a notification marks it read (it stays in Recent)
  function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void dismissNotification(id).finally(syncBell);
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    void clearAllNotifications().finally(syncBell);
  }

  // The × removes it for good
  function remove(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
    void deleteNotification(id).finally(syncBell);
  }

  function clearHistory() {
    if (!window.confirm("Delete all notifications, including past ones?")) return;
    setItems([]);
    void deleteAllNotifications().finally(syncBell);
  }

  const base = view === "unread" ? items.filter((n) => !n.read) : items;
  const visible = base.filter((n) => matches(n, filter));

  return (
    <div>
      {/* Unread / Recent switch + bulk action */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-gray-800 bg-gray-900 p-1">
          {(["unread", "recent"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                view === v ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              {v === "unread" ? "Unread" : "Recent"}
              {v === "unread" && unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {view === "unread"
          ? unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-gray-900 hover:text-white"
              >
                Mark all as read
              </button>
            )
          : items.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-lg border border-gray-800 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-red-500/50 hover:text-red-300"
              >
                Clear history
              </button>
            )}
      </div>

      {/* Type filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const count =
            base.filter((n) => matches(n, tab.key)).length;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filter === tab.key
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-200"
                  : "border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-gray-500">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-gray-800 bg-gray-900 px-6 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-800 text-gray-500">
            <Bell size={21} />
          </div>

          <p className="text-sm font-medium text-gray-200">
            {view === "unread" && items.length > 0 && filter === "all"
              ? "You're all caught up"
              : items.length === 0
                ? "No notifications yet"
                : "Nothing in this category"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            New activity will appear here when someone interacts with you.
          </p>

          {view === "unread" && items.length > 0 && (
            <button
              type="button"
              onClick={() => setView("recent")}
              className="mt-5 rounded-lg bg-indigo-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
            >
              See recent activity
            </button>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border p-4 transition hover:border-gray-700 ${
                n.read
                  ? "border-gray-800/70 bg-gray-900/50"
                  : "border-gray-800 bg-gray-900"
              }`}
            >
              <span
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  n.read ? "bg-gray-800 text-gray-500" : "bg-indigo-500/10 text-indigo-300"
                }`}
              >
                <Icon type={n.type} />
              </span>

              {/* Always clickable, read or not */}
              <Link
                href={n.href}
                onClick={() => !n.read && markRead(n.id)}
                className="min-w-0 flex-1"
              >
                <p className={`text-sm leading-5 ${n.read ? "text-gray-400" : "text-gray-300"}`}>
                  <Message n={n} />
                </p>
                <p className="mt-1.5 text-xs text-gray-500" suppressHydrationWarning>
                  {timeAgo(n.createdAt)}
                </p>
              </Link>

              {!n.read && (
                <span
                  className="mt-2 h-2 w-2 shrink-0 rounded-full bg-indigo-400"
                  aria-label="Unread"
                />
              )}

              <button
                type="button"
                onClick={() => remove(n.id)}
                aria-label="Delete notification"
                className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}