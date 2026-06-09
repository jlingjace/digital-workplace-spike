import { NextRequest, NextResponse } from 'next/server'
import { getCurrentDraft } from '@/lib/page-layouts'

// GET /api/admin/pages/[id]/layout/current — get current draft (null if none)
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const draft = await getCurrentDraft(params.id)
  return NextResponse.json(draft ?? null)
}
