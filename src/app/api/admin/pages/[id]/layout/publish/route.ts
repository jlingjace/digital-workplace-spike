import { NextRequest, NextResponse } from "next/server";
import { publishLayout } from "@/lib/page-layouts";
import { revalidatePath } from "next/cache";

// POST /api/admin/pages/[id]/layout/publish — publish current draft
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const published = await publishLayout(params.id);

    // Invalidate ISR cache immediately
    revalidatePath("/");

    return NextResponse.json({ success: true, version: published.version });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
