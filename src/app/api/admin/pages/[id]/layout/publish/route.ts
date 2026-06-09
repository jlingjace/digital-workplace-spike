import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { publishLayout } from '@/lib/page-layouts'
import { revalidatePath } from 'next/cache'

// POST /api/admin/pages/[id]/layout/publish — promote draft to published
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const page = await prisma.portalPage.findUnique({ where: { id: params.id } })
  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  try {
    const published = await publishLayout(params.id, page.slug)

    // Revalidate the ISR cache for this portal page (slug-specific, not just '/')
    revalidatePath(`/${page.slug}`)
    revalidatePath(`/api/portal/pages/${page.slug}/layout`)

    return NextResponse.json(published)
  } catch (err) {
    if (err instanceof Error && err.message === 'No draft to publish') {
      return NextResponse.json({ error: 'No draft to publish' }, { status: 404 })
    }
    throw err
  }
}
