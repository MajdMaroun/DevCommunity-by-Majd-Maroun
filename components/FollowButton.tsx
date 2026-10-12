"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollow } from "@/app/actions/follow";

interface FollowButtonProps {
  userId: string;
  initialFollowing?: boolean; // I follow them (must come from the database)
  followedBy?: boolean; // they follow me (must come from the database)
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  followedBy = false,
}: FollowButtonProps) {
  const router = useRouter();
  const [following, setFollowing] = useState<boolean>(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    if (isPending) return;

    const previousFollowing = following;

    setFollowing(!following);

    startTransition(async () => {
      try {
        const result = await toggleFollow(userId);

        if (!result.success || result.following === undefined) {
          setFollowing(previousFollowing);
          return;
        }

        setFollowing(result.following);
        router.refresh(); // update follower counts and the saved state
      } catch (error) {
        console.error("Follow error:", error);
        setFollowing(previousFollowing);
      }
    });
  };

  // Follow -> Following -> (they follow me too) Friends
  // They follow me but I don't follow them -> Follow back
  const label = following
    ? followedBy
      ? "Friends"
      : "Following"
    : followedBy
      ? "Follow back"
      : "Follow";

  return (
    <button
      type="button"
      onClick={handleFollow}
      disabled={isPending}
      className={`group rounded-lg px-4 py-2 text-sm font-medium transition ${
        following
          ? "border border-gray-700 text-gray-300 hover:border-red-500/50 hover:bg-gray-800 hover:text-red-300"
          : "bg-indigo-500 text-white hover:bg-indigo-600"
      } ${isPending ? "cursor-not-allowed opacity-60" : ""}`}
    >
      {isPending ? (
        "..."
      ) : following ? (
        <>
          <span className="group-hover:hidden">{label}</span>
          <span className="hidden group-hover:inline">Unfollow</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}