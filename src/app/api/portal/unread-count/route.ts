import { NextResponse } from "next/server";
import { getUnreadCount } from "@/lib/announcements";

export async function GET() {
  try {
    const count = await getUnreadCount();
    return NextResponse.json({ count });
  } catch (err) {
    console.error("[GET /api/portal/unread-count]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
