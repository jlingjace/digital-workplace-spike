import { NextRequest, NextResponse } from "next/server";
import { getPublishedLayout } from "@/lib/page-layouts";

// GET /api/portal/pages/[slug]/layout — public: get published layout
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const blocks = await getPublishedLayout(params.slug);
  if (!blocks) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  return NextResponse.json({ blocks });
}
