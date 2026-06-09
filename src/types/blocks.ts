export type BlockType =
  | "announcements_feed"
  | "quick_access_grid"
  | "action_items_list"
  | "events_calendar"
  | "news_culture_cards"
  | "team_directory"
  | "resources_policies_table"
  | "connected_tools_list"
  | "infrastructure_health"
  | "project_status_board"
  | "dept_hero_banner"
  | "alert_banner"
  | "custom_link_block"
  | "custom_embed_block";

export interface AnnouncementsFeedConfig {
  count: number;
  showImages: boolean;
  audienceScope: "all" | "dept";
}

export interface QuickAccessGridConfig {
  count: number;
  systemCategories: string[];
}

export interface ActionItemsListConfig {
  dataSource: string;
}

export interface EventsCalendarConfig {
  calendarIds: string[];
  daysAhead: number;
}

export interface NewsCultureCardsConfig {
  category: string;
  count: number;
}

export interface TeamDirectoryConfig {
  deptScope: string;
}

export interface ResourcesPoliciesTableConfig {
  department: string;
  docCategory: string;
}

export interface ConnectedToolsListConfig {
  categories: string[];
}

export interface InfrastructureHealthConfig {
  endpointUrl: string;
}

export interface ProjectStatusBoardConfig {
  jiraProjectKeys: string[];
  count: number;
}

export interface StatItem {
  label: string;
  value: string;
}

export interface DeptHeroBannerConfig {
  title: string;
  stats: StatItem[];
  backgroundStyle: "gradient" | "solid" | "image";
}

export interface AlertBannerConfig {
  content: string;
  ctaLabel: string;
  ctaUrl: string;
  variant: "warning" | "info" | "error";
}

export interface LinkItem {
  label: string;
  url: string;
  icon: string;
}

export interface CustomLinkBlockConfig {
  links: LinkItem[];
}

export interface CustomEmbedBlockConfig {
  embedUrl: string;
  height: number;
}

export type BlockConfig =
  | AnnouncementsFeedConfig
  | QuickAccessGridConfig
  | ActionItemsListConfig
  | EventsCalendarConfig
  | NewsCultureCardsConfig
  | TeamDirectoryConfig
  | ResourcesPoliciesTableConfig
  | ConnectedToolsListConfig
  | InfrastructureHealthConfig
  | ProjectStatusBoardConfig
  | DeptHeroBannerConfig
  | AlertBannerConfig
  | CustomLinkBlockConfig
  | CustomEmbedBlockConfig;

export interface Block {
  id: string;
  type: BlockType;
  position: number;
  visible: boolean;
  config: BlockConfig;
}

export interface BlockMeta {
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  defaultConfig: BlockConfig;
}

export const BLOCK_META: Record<BlockType, BlockMeta> = {
  announcements_feed: {
    type: "announcements_feed",
    label: "Announcements Feed",
    description: "Latest company announcements",
    icon: "📢",
    defaultConfig: { count: 5, showImages: true, audienceScope: "all" },
  },
  quick_access_grid: {
    type: "quick_access_grid",
    label: "Quick Access Grid",
    description: "Grid of frequently used links",
    icon: "🔲",
    defaultConfig: { count: 6, systemCategories: ["all"] },
  },
  action_items_list: {
    type: "action_items_list",
    label: "Action Items List",
    description: "Pending tasks and action items",
    icon: "✅",
    defaultConfig: { dataSource: "tasks" },
  },
  events_calendar: {
    type: "events_calendar",
    label: "Events Calendar",
    description: "Upcoming events and meetings",
    icon: "📅",
    defaultConfig: { calendarIds: [], daysAhead: 30 },
  },
  news_culture_cards: {
    type: "news_culture_cards",
    label: "News & Culture Cards",
    description: "Company news and culture updates",
    icon: "📰",
    defaultConfig: { category: "all", count: 6 },
  },
  team_directory: {
    type: "team_directory",
    label: "Team Directory",
    description: "Browse team members",
    icon: "👥",
    defaultConfig: { deptScope: "all" },
  },
  resources_policies_table: {
    type: "resources_policies_table",
    label: "Resources & Policies",
    description: "Company documents and policies",
    icon: "📋",
    defaultConfig: { department: "all", docCategory: "all" },
  },
  connected_tools_list: {
    type: "connected_tools_list",
    label: "Connected Tools",
    description: "Integrated tools and services",
    icon: "🔧",
    defaultConfig: { categories: ["all"] },
  },
  infrastructure_health: {
    type: "infrastructure_health",
    label: "Infrastructure Health",
    description: "System status dashboard",
    icon: "💚",
    defaultConfig: { endpointUrl: "" },
  },
  project_status_board: {
    type: "project_status_board",
    label: "Project Status Board",
    description: "Jira project status overview",
    icon: "📊",
    defaultConfig: { jiraProjectKeys: [], count: 5 },
  },
  dept_hero_banner: {
    type: "dept_hero_banner",
    label: "Dept Hero Banner",
    description: "Department hero section with stats",
    icon: "🏢",
    defaultConfig: {
      title: "",
      stats: [],
      backgroundStyle: "gradient",
    },
  },
  alert_banner: {
    type: "alert_banner",
    label: "Alert Banner",
    description: "Important alerts and notices",
    icon: "⚠️",
    defaultConfig: {
      content: "",
      ctaLabel: "",
      ctaUrl: "",
      variant: "info",
    },
  },
  custom_link_block: {
    type: "custom_link_block",
    label: "Custom Link Block",
    description: "Custom collection of links",
    icon: "🔗",
    defaultConfig: { links: [] },
  },
  custom_embed_block: {
    type: "custom_embed_block",
    label: "Custom Embed",
    description: "Embed external content",
    icon: "🖼️",
    defaultConfig: { embedUrl: "", height: 400 },
  },
};

export interface PageLayoutData {
  id: string;
  pageId: string;
  version: number;
  blocks: Block[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
}
