import { redirect } from "next/navigation";
import NotificationsList from "@/components/NotificationsList";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getNotificationItems } from "@/lib/queries/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  // Everything recent, read or not, so the page still has content after you are caught up
  const { items } = await getNotificationItems(userId, { limit: 100, scope: "all" });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10 text-white">
      <h1 className="text-3xl font-bold">Notifications</h1>
      <p className="mb-8 mt-2 text-gray-400">
        Follows, likes, comments and new posts from people you follow.
      </p>

      <NotificationsList initialItems={items} />
    </main>
  );
}