"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // swap for your auth hook

export type BookmarkedPost = { id: string; title: string; href: string };

const SYNC_EVENT = "bookmarks:changed";
const keyFor = (userId: string) => `bookmarks:${userId}`;

const read = (userId: string): BookmarkedPost[] => {
  try {
    return JSON.parse(localStorage.getItem(keyFor(userId)) ?? "[]");
  } catch {
    return [];
  }
};

export const useBookmarks = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);

  // Reload on user change, and whenever another component instance
  // (e.g. a BookmarkButton) changes the list
  useEffect(() => {
    const load = () => setBookmarks(userId ? read(userId) : []);
    load();
    window.addEventListener(SYNC_EVENT, load);
    window.addEventListener("storage", load); // other tabs
    return () => {
      window.removeEventListener(SYNC_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, [userId]);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  const toggle = useCallback(
    (post: BookmarkedPost) => {
      if (!userId) return;
      const current = read(userId);
      const next = current.some((b) => b.id === post.id)
        ? current.filter((b) => b.id !== post.id)
        : [...current, post];
      localStorage.setItem(keyFor(userId), JSON.stringify(next));
      window.dispatchEvent(new Event(SYNC_EVENT));
    },
    [userId]
  );

  return { bookmarks, isBookmarked, toggle };
};