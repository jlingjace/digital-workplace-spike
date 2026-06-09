import { NextRequest, NextResponse } from 'next/server'
import { getArchivedVersions } from '@/lib/page-layouts'

// GET /api/admin/pages/[id]/layout/versions — list archived versions (max 5)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const versions = await getArchivedVersions(params.id)
  return NextResponse.json(versions)
}
