import { getPublishedLayout } from "@/lib/page-layouts";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import type { Block } from "@/types/blocks";

// ISR: revalidate every 60 seconds; publish calls revalidatePath() for immediate effect
export const revalidate = 60;

export default async function HomePage() {
  let blocks: Block[] | null = null;
  try {
    blocks = await getPublishedLayout("home");
  } catch {
    // DB not available at build time — show empty state
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-800">Digital Workplace</span>
        <a href="/admin" className="text-sm text-blue-600 hover:underline">
          Admin
        </a>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4">
        {blocks && blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No content published yet.</p>
            <a href="/admin" className="text-blue-500 underline mt-2 inline-block">
              Open Admin to add blocks
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
