import { NextRequest, NextResponse } from 'next/server'
import { getPublishedLayout } from '@/lib/page-layouts'

// GET /api/portal/pages/[slug]/layout — public; returns published layout (or empty blocks)
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const blocks = await getPublishedLayout(params.slug)

  return NextResponse.json(
    { blocks: blocks ?? [] },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    }
  )
}
