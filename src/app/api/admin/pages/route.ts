import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PageLayoutStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/admin/pages — list all portal pages with current layout status
export async function GET() {
  const pages = await prisma.portalPage.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      layouts: {
        where: { status: { in: [PageLayoutStatus.DRAFT, PageLayoutStatus.PUBLISHED] } },
        orderBy: { version: 'desc' },
        take: 2,
        select: {
          id: true,
          version: true,
          status: true,
          publishedAt: true,
          createdAt: true,
        },
      },
    },
  })
  return NextResponse.json(pages)
}
