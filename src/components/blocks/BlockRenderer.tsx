import type { Block } from "@/types/blocks";
import AnnouncementsFeed from "./AnnouncementsFeed";
import QuickAccessGrid from "./QuickAccessGrid";
import type { AnnouncementsFeedConfig, QuickAccessGridConfig } from "@/types/blocks";

interface Props {
  blocks: Block[];
}

export default function BlockRenderer({ blocks }: Props) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sorted.map((block) => {
        switch (block.type) {
          case "announcements_feed":
            return (
              <AnnouncementsFeed
                key={block.id}
                config={block.config as AnnouncementsFeedConfig}
              />
            );
          case "quick_access_grid":
            return (
              <QuickAccessGrid
                key={block.id}
                config={block.config as QuickAccessGridConfig}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
