"use client";

import { useState } from "react";

export default function FollowButton() {
  const [following, setFollowing] = useState(false);

  return (
    <button
      onClick={() => setFollowing((prev) => !prev)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        following
          ? "border border-gray-700 text-gray-300 hover:bg-gray-800"
          : "bg-indigo-500 text-white hover:bg-indigo-600"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}