"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, X } from "lucide-react";
import { getPostLikers, toggleLike } from "@/app/actions/engagement";

type Liker = { id: string; name: string; username: string | null };

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function LikersModal({ postId, onClose }: { postId: string; onClose: () => void }) {
  const [people, setPeople] = useState<Liker[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  // Load the list every time the modal opens, so it is always current
  useEffect(() => {
    let active = true;
    getPostLikers(postId).then((res) => {
      if (!active) return;
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPeople(res.people);
      setTotal(res.total);
    });
    return () => {
      active = false;
    };
  }, [postId]);

  // Close with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="People who liked this post"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-800 bg-gray-950 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
          <h3 className="text-sm font-semibold text-white">
            Liked by{people ? ` (${total})` : ""}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {error ? (
            <p className="px-3 py-6 text-center text-sm text-red-400">{error}</p>
          ) : !people ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">Loading...</p>
          ) : people.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">No likes yet.</p>
          ) : (
            people.map((p) => {
              const body = (
                <>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-semibold text-white">
                    {initials(p.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-white">
                      {p.name}
                    </span>
                    {p.username && (
                      <span className="block truncate text-xs text-gray-500">
                        @{p.username}
                      </span>
                    )}
                  </span>
                </>
              );

              return p.username ? (
                <Link
                  key={p.id}
                  href={`/profile/${encodeURIComponent(p.username)}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-gray-900"
                >
                  {body}
                </Link>
              ) : (
                <div key={p.id} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  {body}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function LikeButton({
  postId,
  initialLiked,
  initialCount,
  signedIn,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pop, setPop] = useState(false); // plays the "pop" animation right after liking
  const [showLikers, setShowLikers] = useState(false);
  const [pending, startTransition] = useTransition();

  function onClick() {
    // Signed-out visitors are sent to log in instead
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (pending) return;

    const before = { liked, count };
    const next = !liked;

    setLiked(next); // update instantly
    setCount(count + (next ? 1 : -1));

    if (next) {
      setPop(true);
      window.setTimeout(() => setPop(false), 450);
    }

    startTransition(async () => {
      const res = await toggleLike(postId);
      if (!res.ok) {
        setLiked(before.liked); // roll back
        setCount(before.count);
        return;
      }
      setLiked(res.liked); // use the server's real numbers
      setCount(res.count);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={liked}
        aria-label={liked ? "Unlike this post" : "Like this post"}
        title={signedIn ? (liked ? "Unlike" : "Like") : "Sign in to like"}
        className="group relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-slate-800/70 active:scale-90"
      >
        {/* Expanding ghost heart, shown only while the like "pops" */}
        {pop && (
          <Heart
            aria-hidden="true"
            className="absolute h-7 w-7 animate-ping fill-rose-500 text-rose-500 opacity-60"
          />
        )}

        <Heart
          className={`relative h-7 w-7 transition-transform duration-200 ease-out ${
            liked
              ? "fill-rose-500 text-rose-500"
              : "text-slate-300 group-hover:text-slate-400"
          } ${pop ? "scale-125" : "scale-100"}`}
        />
      </button>

      {/* Clicking the count shows who liked the post */}
      {count === 0 ? (
        <span className="text-sm text-slate-400">Be the first to like this</span>
      ) : (
        <button
          type="button"
          onClick={() => setShowLikers(true)}
          title="See who liked this"
          className="text-sm font-semibold text-white transition hover:underline"
        >
          {count.toLocaleString()} {count === 1 ? "like" : "likes"}
        </button>
      )}

      {showLikers && <LikersModal postId={postId} onClose={() => setShowLikers(false)} />}
    </div>
  );
}