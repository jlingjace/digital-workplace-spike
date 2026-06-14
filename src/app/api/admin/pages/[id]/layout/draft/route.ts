import { NextRequest, NextResponse } from "next/server";
import { saveDraft } from "@/lib/page-layouts";
import { z } from "zod";
import type { Block } from "@/types/blocks";

const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.number(),
  visible: z.boolean(),
  config: z.record(z.unknown()),
});

const SaveDraftSchema = z.object({
  blocks: z.array(BlockSchema),
  versionId: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = SaveDraftSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const layout = await saveDraft(
      params.id,
      parsed.data.blocks as unknown as Block[],
      parsed.data.versionId
    );
    return NextResponse.json(layout);
  } catch (err) {
    const e = err as Error & { code?: string };
    if (e.code === "CONFLICT") {
      return NextResponse.json({ error: e.message }, { status: 409 });
    }
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
