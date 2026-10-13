import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/queries/auth";
import { getNotificationItems } from "@/lib/queries/notifications";

export const dynamic = "force-dynamic";

// The bell only shows unread notifications; `total` is the unread count for the badge
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ items: [], total: 0 });
  }

  const { items, unread } = await getNotificationItems(userId, {
    limit: 30,
    scope: "unread",
  });

  return NextResponse.json(
    { items, total: unread },
    { headers: { "Cache-Control": "no-store" } }
  );
}