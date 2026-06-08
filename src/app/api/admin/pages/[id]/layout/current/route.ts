import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Block } from "@/types/blocks";

// GET /api/admin/pages/[id]/layout/current — get current draft or published layout
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const draft = await prisma.pageLayout.findFirst({
    where: { pageId: params.id, status: "DRAFT" },
    orderBy: { version: "desc" },
  });

  if (draft) {
    return NextResponse.json({
      ...draft,
      blocks: draft.blocks as unknown as Block[],
    });
  }

  const published = await prisma.pageLayout.findFirst({
    where: { pageId: params.id, status: "PUBLISHED" },
    orderBy: { version: "desc" },
  });

  if (!published) {
    return NextResponse.json({ error: "No layout found" }, { status: 404 });
  }

  return NextResponse.json({
    ...published,
    blocks: published.blocks as unknown as Block[],
  });
}
