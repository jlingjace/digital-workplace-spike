import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rollbackToVersion } from '@/lib/page-layouts'

const requestSchema = z.object({
  versionId: z.string(),
})

// POST /api/admin/pages/[id]/layout/rollback — create draft from archived version
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const newDraft = await rollbackToVersion(params.id, parsed.data.versionId)
    return NextResponse.json(newDraft)
  } catch (err) {
    if (
      err instanceof Error &&
      err.message === 'Target version not found or not in archived status'
    ) {
      return NextResponse.json({ error: err.message }, { status: 404 })
    }
    throw err
  }
}
