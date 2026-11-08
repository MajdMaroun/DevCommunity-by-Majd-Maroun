import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Bell } from "lucide-react";
import NotificationsList from "@/components/NotificationsList";
import Reveal from "@/components/Reveal";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getNotificationItems } from "@/lib/queries/notifications";

function NotificationsLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 text-white sm:px-6 lg:py-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-slate-800" />
          <div className="h-4 w-full max-w-md animate-pulse rounded bg-slate-900" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 80}ms` }}
            className="h-20 animate-pulse rounded-xl border border-slate-800 bg-[#0f1629]"
          />
        ))}
      </div>
    </main>
  );
}

async function NotificationsContent() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/login");
  }

  const { items } = await getNotificationItems(userId, {
    limit: 100,
    scope: "all",
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-7 text-white sm:px-6 lg:py-10">
      <Reveal>
        <div className="group mb-8 flex items-start gap-4 border-b border-slate-800 pb-7">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/15 text-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-blue-500/25 group-hover:shadow-lg group-hover:shadow-blue-500/20 motion-reduce:transform-none">
            <Bell className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12 motion-reduce:transform-none" />
          </span>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Follows, likes, comments and new posts from people you follow.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <NotificationsList initialItems={items} />
      </Reveal>
    </main>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsLoading />}>
      <NotificationsContent />
    </Suspense>
  );
}