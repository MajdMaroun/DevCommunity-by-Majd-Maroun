"use client";

import { useMemo, useSyncExternalStore } from "react";

export type BookmarkedPost = {
  id: string;
  title: string;
  href: string;
};

const KEY = "bookmarks";
const listeners = new Set<() => void>();

const getSnapshot = () => localStorage.getItem(KEY) ?? "[]";
const getServerSnapshot = () => "[]";

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb); // sync across tabs
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

const write = (list: BookmarkedPost[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
  listeners.forEach((l) => l());
};

export function useBookmarks() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const bookmarks = useMemo(() => JSON.parse(raw) as BookmarkedPost[], [raw]);

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const toggle = (post: BookmarkedPost) =>
    write(
      isBookmarked(post.id)
        ? bookmarks.filter((b) => b.id !== post.id)
        : [...bookmarks, post]
    );

  return { bookmarks, isBookmarked, toggle };
}