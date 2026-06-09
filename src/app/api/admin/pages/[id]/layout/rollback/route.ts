import { NextRequest, NextResponse } from "next/server";
import { rollbackLayout } from "@/lib/page-layouts";
import { z } from "zod";

const RollbackSchema = z.object({
  versionId: z.string(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = RollbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "versionId is required" }, { status: 400 });
  }

  try {
    const layout = await rollbackLayout(params.id, parsed.data.versionId);
    return NextResponse.json({ success: true, version: layout.version, id: layout.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Rollback failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
