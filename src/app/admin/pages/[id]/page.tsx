import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
import BlockEditor from "@/components/admin/BlockEditor";
import type { Block } from "@/types/blocks";
import Link from "next/link";

interface PageProps {
  params: { id: string };
}

export default async function AdminPageEdit({ params }: PageProps) {
  const page = await prisma.portalPage.findUnique({
    where: { id: params.id },
  });

  if (!page) notFound();

  // Get current draft or latest published for initial state
  const layout = await prisma.pageLayout.findFirst({
    where: { pageId: params.id, status: { in: ["DRAFT", "PUBLISHED"] } },
    orderBy: [{ status: "asc" }, { version: "desc" }],
  });

  const initialBlocks: Block[] = layout ? (layout.blocks as unknown as Block[]) : [];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin" className="text-gray-500 hover:text-gray-700 text-sm">
          ← Pages
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{page.title}</h1>
        {layout && (
          <span
            className={`text-xs px-2 py-1 rounded ${
              layout.status === "DRAFT"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {layout.status === "DRAFT" ? `Draft` : `v${layout.version} Published`}
          </span>
        )}
      </div>

      <BlockEditor pageId={page.id} initialBlocks={initialBlocks} />
    </div>
  );
}
