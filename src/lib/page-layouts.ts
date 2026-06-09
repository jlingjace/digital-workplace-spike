import { prisma } from '@/lib/prisma'
import { PageLayoutStatus } from '@prisma/client'
import type { Block } from '@/types/blocks'

const MAX_ARCHIVED_VERSIONS = 5

export async function getPublishedLayout(slug: string): Promise<Block[] | null> {
  const page = await prisma.portalPage.findUnique({
    where: { slug },
    include: {
      layouts: {
        where: { status: PageLayoutStatus.PUBLISHED },
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
  })

  if (!page || page.layouts.length === 0) return null
  return page.layouts[0].blocks as unknown as Block[]
}

export async function getCurrentDraft(pageId: string) {
  return prisma.pageLayout.findFirst({
    where: { pageId, status: PageLayoutStatus.DRAFT },
    orderBy: { version: 'desc' },
  })
}

export async function getArchivedVersions(pageId: string) {
  return prisma.pageLayout.findMany({
    where: { pageId, status: PageLayoutStatus.ARCHIVED },
    orderBy: { version: 'desc' },
    take: MAX_ARCHIVED_VERSIONS,
    select: {
      id: true,
      version: true,
      status: true,
      publishedAt: true,
      createdAt: true,
    },
  })
}

export async function saveDraft(
  pageId: string,
  blocks: Block[],
  userId?: string,
  versionId?: string
) {
  const existing = await getCurrentDraft(pageId)

  if (existing) {
    // Optimistic locking: if caller provided a versionId, it must match the current draft's id
    if (versionId && existing.id !== versionId) {
      throw new OptimisticLockError(
        `Draft has been modified by another user. Please refresh and retry.`
      )
    }
    return prisma.pageLayout.update({
      where: { id: existing.id },
      data: { blocks: blocks as object[], updatedAt: new Date() },
    })
  }

  // No existing draft — calculate next version number
  const latest = await prisma.pageLayout.findFirst({
    where: { pageId },
    orderBy: { version: 'desc' },
    select: { version: true },
  })
  const nextVersion = (latest?.version ?? 0) + 1

  return prisma.pageLayout.create({
    data: {
      pageId,
      version: nextVersion,
      blocks: blocks as object[],
      status: PageLayoutStatus.DRAFT,
      createdById: userId,
    },
  })
}

export async function publishLayout(pageId: string, slug: string) {
  return prisma.$transaction(async (tx) => {
    const draft = await tx.pageLayout.findFirst({
      where: { pageId, status: PageLayoutStatus.DRAFT },
    })
    if (!draft) throw new Error('No draft to publish')

    // Move current published → archived
    await tx.pageLayout.updateMany({
      where: { pageId, status: PageLayoutStatus.PUBLISHED },
      data: { status: PageLayoutStatus.ARCHIVED },
    })

    // Promote draft → published
    const published = await tx.pageLayout.update({
      where: { id: draft.id },
      data: {
        status: PageLayoutStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })

    // Enforce max archived versions: keep most recent MAX_ARCHIVED_VERSIONS
    const archived = await tx.pageLayout.findMany({
      where: { pageId, status: PageLayoutStatus.ARCHIVED },
      orderBy: { version: 'desc' },
      select: { id: true },
    })
    if (archived.length > MAX_ARCHIVED_VERSIONS) {
      const toDelete = archived.slice(MAX_ARCHIVED_VERSIONS)
      await tx.pageLayout.deleteMany({
        where: { id: { in: toDelete.map((a) => a.id) } },
      })
    }

    return published
  })
}

export async function rollbackToVersion(pageId: string, versionId: string) {
  const target = await prisma.pageLayout.findFirst({
    where: { id: versionId, pageId, status: PageLayoutStatus.ARCHIVED },
  })
  if (!target) {
    throw new Error('Target version not found or not in archived status')
  }

  // Remove any existing draft before creating rollback draft
  await prisma.pageLayout.deleteMany({
    where: { pageId, status: PageLayoutStatus.DRAFT },
  })

  // New version number = max existing + 1
  const latest = await prisma.pageLayout.findFirst({
    where: { pageId },
    orderBy: { version: 'desc' },
    select: { version: true },
  })
  const nextVersion = (latest?.version ?? 0) + 1

  return prisma.pageLayout.create({
    data: {
      pageId,
      version: nextVersion,
      blocks: target.blocks as object[],
      status: PageLayoutStatus.DRAFT,
      createdById: null,
    },
  })
}

export class OptimisticLockError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OptimisticLockError'
  }
}
