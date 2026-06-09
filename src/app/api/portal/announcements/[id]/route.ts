import { NextRequest, NextResponse } from "next/server";
import { getAnnouncement } from "@/lib/announcements";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = await getAnnouncement(params.id);
    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }
    return NextResponse.json(announcement);
  } catch (err) {
    console.error(`[GET /api/portal/announcements/${params.id}]`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
