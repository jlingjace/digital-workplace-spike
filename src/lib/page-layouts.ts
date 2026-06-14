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
  versionId?: string,
  userId?: string
) {
  const existing = await getCurrentDraft(pageId);

  if (existing) {
    if (versionId && versionId !== existing.id) {
      const err = new Error("Version conflict — the page was modified elsewhere.");
      (err as Error & { code: string }).code = "CONFLICT";
      throw err;
    }
    return prisma.pageLayout.update({
      where: { id: existing.id },
      data: { blocks: blocks as object[], updatedAt: new Date() },
    });
  }

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

export async function publishLayout(pageId: string, userId?: string) {
  const draft = await getCurrentDraft(pageId);
  if (!draft) throw new Error("No draft to publish");

  // Wrap archive + publish + prune in a transaction to prevent partial state
  return prisma.$transaction(async (tx) => {
    await tx.pageLayout.updateMany({
      where: { pageId, status: "PUBLISHED" },
      data: { status: "ARCHIVED" },
    });

    const published = await tx.pageLayout.update({
      where: { id: draft.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        createdById: userId,
      },
    });

    // Prune: keep only MAX_VERSIONS archived versions
    const excess = await tx.pageLayout.findMany({
      where: { pageId, status: "ARCHIVED" },
      orderBy: { version: "desc" },
      skip: MAX_VERSIONS,
      select: { id: true },
    });
    if (excess.length > 0) {
      await tx.pageLayout.deleteMany({ where: { id: { in: excess.map((l) => l.id) } } });
    }

    return published;
  });
}

export async function rollbackLayout(pageId: string, versionId: string, userId?: string) {
  const target = await prisma.pageLayout.findUnique({ where: { id: versionId } });
  if (!target || target.pageId !== pageId) throw new Error("Version not found");

  // Atomic: delete existing draft and create new one in a single transaction
  return prisma.$transaction(async (tx) => {
    await tx.pageLayout.deleteMany({ where: { pageId, status: "DRAFT" } });

    const latest = await tx.pageLayout.findFirst({
      where: { pageId },
      orderBy: { version: "desc" },
      select: { version: true },
    });
    const nextVersion = (latest?.version ?? 0) + 1;

    return tx.pageLayout.create({
      data: {
        pageId,
        version: nextVersion,
        blocks: target.blocks ?? [],
        status: "DRAFT",
        createdById: userId,
      },
    });
  });
}

export async function getLayoutVersions(pageId: string) {
  return prisma.pageLayout.findMany({
    where: { pageId, status: { in: ["ARCHIVED", "PUBLISHED"] } },
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
