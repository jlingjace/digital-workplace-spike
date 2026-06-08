import { prisma } from "@/lib/prisma";
import type { Block } from "@/types/blocks";

const MAX_VERSIONS = 5;

export async function getPublishedLayout(slug: string): Promise<Block[] | null> {
  const page = await prisma.portalPage.findUnique({
    where: { slug },
    include: {
      layouts: {
        where: { status: "PUBLISHED" },
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!page || page.layouts.length === 0) return null;
  return page.layouts[0].blocks as unknown as Block[];
}

export async function getCurrentDraft(pageId: string) {
  return prisma.pageLayout.findFirst({
    where: { pageId, status: "DRAFT" },
    orderBy: { version: "desc" },
  });
}

export async function saveDraft(
  pageId: string,
  blocks: Block[],
  userId?: string
) {
  const existing = await getCurrentDraft(pageId);

  if (existing) {
    return prisma.pageLayout.update({
      where: { id: existing.id },
      data: { blocks: blocks as object[], updatedAt: new Date() },
    });
  }

  // Get next version number
  const latest = await prisma.pageLayout.findFirst({
    where: { pageId },
    orderBy: { version: "desc" },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  return prisma.pageLayout.create({
    data: {
      pageId,
      version: nextVersion,
      blocks: blocks as object[],
      status: "DRAFT",
      createdById: userId,
    },
  });
}

export async function publishLayout(
  pageId: string,
  userId?: string
) {
  const draft = await getCurrentDraft(pageId);
  if (!draft) throw new Error("No draft to publish");

  // Archive old published layouts
  await prisma.pageLayout.updateMany({
    where: { pageId, status: "PUBLISHED" },
    data: { status: "ARCHIVED" },
  });

  // Publish the draft
  const published = await prisma.pageLayout.update({
    where: { id: draft.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      createdById: userId,
    },
  });

  // Prune old archived versions, keep MAX_VERSIONS
  const archived = await prisma.pageLayout.findMany({
    where: { pageId, status: "ARCHIVED" },
    orderBy: { version: "desc" },
    skip: MAX_VERSIONS - 1,
  });
  if (archived.length > 0) {
    await prisma.pageLayout.deleteMany({
      where: { id: { in: archived.map((l) => l.id) } },
    });
  }

  return published;
}

export async function getLayoutVersions(pageId: string) {
  return prisma.pageLayout.findMany({
    where: { pageId },
    orderBy: { version: "desc" },
    take: MAX_VERSIONS,
    select: {
      id: true,
      version: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      createdBy: { select: { name: true, email: true } },
    },
  });
}
