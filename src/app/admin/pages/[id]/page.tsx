import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlockEditor from "@/components/admin/BlockEditor";
import type { Block } from "@/types/blocks";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminPageEdit({ params }: PageProps) {
  const page = await prisma.portalPage.findUnique({ where: { id: params.id } });
  if (!page) notFound();

  // Prefer draft; fall back to published for initial edit state
  const layout = await prisma.pageLayout.findFirst({
    where: { pageId: params.id, status: { in: ["DRAFT", "PUBLISHED"] } },
    orderBy: [{ status: "asc" }, { version: "desc" }],
  });

  const initialBlocks: Block[] = layout
    ? (layout.blocks as unknown as Block[]).map((b, i) => ({
        ...b,
        position: (b as Block & { order?: number }).position ?? (b as Block & { order?: number }).order ?? i,
        visible: b.visible ?? true,
      }))
    : [];

  return (
    <div className="flex flex-col h-screen">
      {/* Breadcrumb bar */}
      <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm flex-shrink-0">
        <Link href="/admin" className="text-gray-400 hover:text-white transition-colors">
          ← 页面列表
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-white font-medium">{page.title}</span>
        {layout && (
          <span
            className={`ml-auto text-xs px-2 py-0.5 rounded font-mono ${
              layout.status === "DRAFT"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-green-500/20 text-green-300"
            }`}
          >
            {layout.status === "DRAFT" ? "草稿" : `v${layout.version} 已发布`}
          </span>
        )}
      </div>

      <BlockEditor
        pageId={page.id}
        pageTitle={page.title}
        initialBlocks={initialBlocks}
        initialVersionId={layout?.id}
      />
    </div>
  );
}
