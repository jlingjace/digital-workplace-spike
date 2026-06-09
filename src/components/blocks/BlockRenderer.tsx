import type { Block } from "@/types/blocks";
import AnnouncementsFeed from "./AnnouncementsFeed";
import QuickAccessGrid from "./QuickAccessGrid";
import type { AnnouncementsFeedConfig, QuickAccessGridConfig } from "@/types/blocks";

interface Props {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: Props) {
  const sorted = [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="space-y-6">
      {sorted
        .filter((b) => b.visible !== false)
        .map((block) => {
          switch (block.type) {
            case "announcements_feed":
              return <AnnouncementsFeed key={block.id} config={block.config as AnnouncementsFeedConfig} />;
            case "quick_access_grid":
              return <QuickAccessGrid key={block.id} config={block.config as QuickAccessGridConfig} />;
            default:
              return (
                <div key={block.id} className="bg-gray-50 border border-dashed border-gray-300 rounded-card p-6 text-center text-gray-400 text-sm">
                  <span className="text-2xl block mb-2">🚧</span>
                  {block.type.replace(/_/g, " ")} — coming soon
                </div>
              );
          }
        })}
    </div>
  );
}
