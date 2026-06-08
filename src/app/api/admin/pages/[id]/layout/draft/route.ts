import { NextRequest, NextResponse } from "next/server";
import { saveDraft } from "@/lib/page-layouts";
import { z } from "zod";
import type { Block } from "@/types/blocks";

const BlockSchema = z.object({
  id: z.string(),
  type: z.enum(["announcements_feed", "quick_access_grid"]),
  order: z.number(),
  config: z.record(z.unknown()),
});

const SaveDraftSchema = z.object({
  blocks: z.array(BlockSchema),
});

// PUT /api/admin/pages/[id]/layout/draft — save draft
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const parsed = SaveDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const layout = await saveDraft(params.id, parsed.data.blocks as unknown as Block[]);
  return NextResponse.json(layout);
}
