import { NextRequest, NextResponse } from "next/server";
import { getLayoutVersions } from "@/lib/page-layouts";

// GET /api/admin/pages/[id]/layout/versions — list recent layout versions
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const versions = await getLayoutVersions(params.id);
  return NextResponse.json({ versions });
}
