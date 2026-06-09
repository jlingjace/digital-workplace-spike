import { NextRequest, NextResponse } from "next/server";

// Mock handler — marks announcement as read.
// TODO: Persist read status to DB once SNOW-187 (auth) is integrated.
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Validate id exists (mock check)
  if (!id) {
    return NextResponse.json({ error: "Missing announcement id" }, { status: 400 });
  }

  // In production: update UserAnnouncementRead record with userId + timestamp
  return NextResponse.json({
    success: true,
    announcementId: id,
    readAt: new Date().toISOString(),
  });
}
