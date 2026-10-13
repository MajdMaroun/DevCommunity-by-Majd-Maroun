"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLike } from "@/app/actions/engagement";

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
  const [pending, startTransition] = useTransition();

  function onClick() {
    // Signed-out visitors are sent to log in instead
    if (!signedIn) {
      router.push("/login");
      return;
    }
    if (pending) return;

    const before = { liked, count };
    setLiked(!liked); // update instantly
    setCount(count + (liked ? -1 : 1));

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
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      title={signedIn ? (liked ? "Unlike" : "Like") : "Sign in to like"}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
        liked
          ? "border-pink-500/50 bg-pink-500/10 text-pink-300"
          : "border-gray-700 text-gray-300 hover:bg-gray-800"
      }`}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-pink-400 text-pink-400" : ""}`} />
      {count} {count === 1 ? "like" : "likes"}
    </button>
  );
}