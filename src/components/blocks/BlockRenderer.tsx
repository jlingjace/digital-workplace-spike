import type { Block } from "@/types/blocks";
import type {
  AnnouncementsFeedConfig,
  QuickAccessGridConfig,
  ActionItemsConfig,
  EventsCalendarConfig,
  NewsCultureConfig,
} from "@/types/blocks";

// Legacy block (keep for backwards compat with existing saved layouts)
import QuickAccessGrid from "./QuickAccessGrid";

// Enhanced blocks
import AnnouncementsBlock from "./AnnouncementsBlock";
import ActionItemsBlock from "./ActionItemsBlock";
import EventsCalendarBlock from "./EventsCalendarBlock";
import NewsCultureBlock from "./NewsCultureBlock";

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
              <AnnouncementsBlock
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
          case "action_items":
            return (
              <ActionItemsBlock
                key={block.id}
                config={block.config as ActionItemsConfig}
              />
            );
          case "events_calendar":
            return (
              <EventsCalendarBlock
                key={block.id}
                config={block.config as EventsCalendarConfig}
              />
            );
          case "news_culture":
            return (
              <NewsCultureBlock
                key={block.id}
                config={block.config as NewsCultureConfig}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
