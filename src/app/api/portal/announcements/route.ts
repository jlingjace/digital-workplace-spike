import { NextRequest, NextResponse } from "next/server";
import { getAnnouncements } from "@/lib/announcements";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const search = searchParams.get("search") ?? undefined;
  const department = searchParams.get("department") ?? undefined;
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Math.min(parseInt(limitRaw, 10), 50) : 10;

  try {
    const result = await getAnnouncements({ search, department, cursor, limit });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/portal/announcements]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
