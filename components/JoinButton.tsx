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
      await toggleMembership(communityId);
    });
  }

  const base = compact
    ? "rounded-md px-3 py-1 text-[11px]"
    : "mt-3 w-full rounded-lg py-1.5 text-xs";

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
      {optimisticJoined ? "Joined" : "Join Community"}
    </button>
  );
}