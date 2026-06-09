export type BlockType =
  | "announcements_feed"
  | "quick_access_grid"
  | "action_items"
  | "events_calendar"
  | "news_culture";

export interface AnnouncementsFeedConfig {
  title: string;
  count: number;
}

export interface QuickAccessGridConfig {
  title: string;
  items: Array<{ label: string; url: string; icon?: string }>;
}

export interface ActionItemsConfig {
  title: string;
}

export interface EventsCalendarConfig {
  title: string;
}

export interface NewsCultureConfig {
  title: string;
  count?: number;
}

export type BlockConfig =
  | AnnouncementsFeedConfig
  | QuickAccessGridConfig
  | ActionItemsConfig
  | EventsCalendarConfig
  | NewsCultureConfig;

export interface Block {
  id: string;
  type: BlockType;
  order: number;
  config: BlockConfig;
}

export interface PageLayoutData {
  id: string;
  pageId: string;
  version: number;
  blocks: Block[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
}
