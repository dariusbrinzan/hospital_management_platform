import { NextRequest, NextResponse } from "next/server";
import { notificationHelpers } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }

  const notifications = notificationHelpers.getByUserId(userId, 10);
  const unreadCount = notificationHelpers.getUnreadCount(userId);

  return NextResponse.json({ notifications, unreadCount });
}
