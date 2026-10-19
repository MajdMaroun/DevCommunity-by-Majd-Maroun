"use client";

import { useState, useTransition } from "react";
import { toggleFollow } from "@/app/actions/follow";

interface FollowButtonProps {
userId: string;
initialFollowing?: boolean;
followedBy?: boolean;
}

export default function FollowButton({
userId,
initialFollowing = false,
followedBy = false,
}: FollowButtonProps) {
const [following, setFollowing] = useState(initialFollowing);
const [isPending, startTransition] = useTransition();

const handleFollow = () => {
if (isPending) return;

const previousFollowing = following;
const nextFollowing = !following;

// Update the button immediately.
setFollowing(nextFollowing);

startTransition(async () => {
  try {
    const result = await toggleFollow(userId);

    if (!result.success || result.following === undefined) {
      setFollowing(previousFollowing);
      return;
    }

    setFollowing(result.following);
  } catch (error) {
    console.error("Follow error:", error);
    setFollowing(previousFollowing);
  }
});

};

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
aria-busy={isPending}
className={`group rounded-lg px-4 py-2 text-sm font-medium transition ${
        following
          ? "border border-gray-700 text-gray-300 hover:border-red-500/50 hover:bg-gray-800 hover:text-red-300"
          : "bg-indigo-500 text-white hover:bg-indigo-600"
      } ${isPending ? "cursor-wait opacity-70" : ""}`}
>
{isPending ? (
"..."
) : following ? (
<> <span className="group-hover:hidden">{label}</span> <span className="hidden group-hover:inline">Unfollow</span>
</>
) : (
label
)} </button>
);
}
