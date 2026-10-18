import { redirect } from "next/navigation";
import { Suspense } from "react";
import NotificationsList from "@/components/NotificationsList";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getNotificationItems } from "@/lib/queries/notifications";

async function NotificationsContent() {
const userId = await getCurrentUserId();

if (!userId) {
redirect("/login");
}

const { items } = await getNotificationItems(userId, {
limit: 100,
scope: "all",
});

return ( <main className="mx-auto max-w-3xl px-6 py-10 text-white"> <h1 className="text-3xl font-bold">Notifications</h1>

  <p className="mb-8 mt-2 text-gray-400">
    Follows, likes, comments and new posts from people you follow.
  </p>

  <NotificationsList initialItems={items} />
</main>
);
}

export default function NotificationsPage() {
return (
<Suspense fallback={<div className="p-6 text-white">Loading notifications...</div>}> <NotificationsContent /> </Suspense>
);
}
