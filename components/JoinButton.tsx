"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleMembership } from "@/app/actions/community";

export default function JoinButton({
  communityId,
  joined,
  signedIn,
  compact = false,
}: {
  communityId: string;
  joined: boolean;
  signedIn: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticJoined, setOptimisticJoined] = useOptimistic(joined);

  function onClick() {
    if (!signedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
  setOptimisticJoined(!optimisticJoined);
  const res = await toggleMembership(communityId);
  if (!res.ok) {
    console.error("toggleMembership failed:", res.error);
    alert(`Could not update membership: ${res.error}`); // temporary, remove once it works
  }
  router.refresh();
});
  }

  // No top margin here: the card footer wrapper handles spacing
  const base = compact
    ? "rounded-md px-3 py-1 text-[11px]"
    : "w-full rounded-lg py-1.5 text-xs";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={`${base} border font-medium transition disabled:opacity-60 ${
        optimisticJoined
          ? "border-slate-700 bg-slate-800/60 text-slate-200 hover:border-red-500/50 hover:text-red-300"
          : "border-slate-700 text-slate-200 hover:bg-slate-800"
      }`}
    >
      {optimisticJoined
        ? compact
          ? "Leave"
          : "Leave Community"
        : compact
          ? "Join"
          : "Join Community"}
    </button>
  );
}