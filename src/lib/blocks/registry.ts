import { z } from 'zod'
import type { BlockType, BlockTypeDefinition } from '@/types/blocks'

export const blockSchemas = {
  announcements_feed: z.object({
    title: z.string().default('Latest Announcements'),
    count: z.number().int().min(1).max(20).default(5),
    showImages: z.boolean().default(true),
    audienceScope: z.enum(['all', 'dept']).default('all'),
  }),

  quick_access_grid: z.object({
    count: z.number().int().min(2).max(12).default(6),
    systemCategories: z.array(z.string()).default(['all']),
  }),

  action_items_list: z.object({
    title: z.string().default('My Action Items'),
    maxItems: z.number().int().min(1).max(50).default(10),
    showCompleted: z.boolean().default(false),
    sources: z.array(z.enum(['jira', 'email', 'slack'])).default(['jira']),
  }),

  events_calendar: z.object({
    calendarIds: z.array(z.string()).default([]),
    daysAhead: z.number().int().min(1).max(90).default(30),
    maxEvents: z.number().int().min(1).max(20).default(5),
    showLocation: z.boolean().default(true),
  }),

  news_culture_cards: z.object({
    title: z.string().default('News & Culture'),
    count: z.number().int().min(1).max(12).default(6),
    showThumbnail: z.boolean().default(true),
    categories: z.array(z.string()).default([]),
  }),

  team_directory: z.object({
    title: z.string().default('Team Directory'),
    departmentFilter: z.string().optional(),
    showSearch: z.boolean().default(true),
    displayMode: z.enum(['grid', 'list']).default('grid'),
    maxVisible: z.number().int().min(4).max(24).default(12),
  }),

  resources_policies_table: z.object({
    title: z.string().default('Resources & Policies'),
    categories: z.array(z.string()).default([]),
    showSearch: z.boolean().default(true),
    maxItems: z.number().int().min(5).max(50).default(20),
  }),

  connected_tools_list: z.object({
    title: z.string().default('Connected Tools'),
    showIcons: z.boolean().default(true),
    displayMode: z.enum(['grid', 'list']).default('grid'),
    categories: z.array(z.string()).default(['all']),
  }),

  infrastructure_health: z.object({
    title: z.string().default('Infrastructure Health'),
    services: z.array(z.string()).default([]),
    refreshIntervalSeconds: z.number().int().min(30).max(300).default(60),
    showHistogram: z.boolean().default(true),
  }),

  project_status_board: z.object({
    title: z.string().default('Project Status'),
    projectKeys: z.array(z.string()).default([]),
    showRoadmap: z.boolean().default(false),
    maxProjects: z.number().int().min(1).max(10).default(5),
  }),

  dept_hero_banner: z.object({
    title: z.string().default(''),
    subtitle: z.string().default(''),
    backgroundUrl: z.string().url().optional().or(z.literal('')),
    ctaLabel: z.string().default(''),
    ctaUrl: z.string().default(''),
  }),

  alert_banner: z.object({
    message: z.string().default(''),
    severity: z.enum(['info', 'warning', 'error', 'success']).default('info'),
    dismissible: z.boolean().default(true),
    expiresAt: z.string().datetime().optional(),
    linkLabel: z.string().optional(),
    linkUrl: z.string().optional(),
  }),

  custom_link_block: z.object({
    title: z.string().default(''),
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
      iconUrl: z.string().optional(),
      openInNewTab: z.boolean().default(false),
    })).default([]),
    columns: z.number().int().min(1).max(4).default(2),
  }),

  custom_embed_block: z.object({
    title: z.string().default(''),
    embedUrl: z.string().url().default(''),
    height: z.number().int().min(100).max(1200).default(400),
    allowFullscreen: z.boolean().default(true),
    sandboxPolicy: z.string().default('allow-scripts allow-same-origin'),
  }),
} satisfies Record<BlockType, z.ZodObject<any>>

export const blockTypeDefinitions: BlockTypeDefinition[] = [
  {
    type: 'announcements_feed',
    label: 'Announcements Feed',
    description: 'Displays a list of company or department announcements',
    configSchema: blockSchemas.announcements_feed.shape,
  },
  {
    type: 'quick_access_grid',
    label: 'Quick Access Grid',
    description: 'Grid of frequently-accessed internal tools and links',
    configSchema: blockSchemas.quick_access_grid.shape,
  },
  {
    type: 'action_items_list',
    label: 'Action Items List',
    description: 'Personal to-dos and action items from connected tools',
    configSchema: blockSchemas.action_items_list.shape,
  },
  {
    type: 'events_calendar',
    label: 'Events Calendar',
    description: 'Upcoming events from Google Calendar',
    configSchema: blockSchemas.events_calendar.shape,
  },
  {
    type: 'news_culture_cards',
    label: 'News & Culture Cards',
    description: 'Company news, blog posts, and culture updates',
    configSchema: blockSchemas.news_culture_cards.shape,
  },
  {
    type: 'team_directory',
    label: 'Team Directory',
    description: 'Employee directory with search and filter',
    configSchema: blockSchemas.team_directory.shape,
  },
  {
    type: 'resources_policies_table',
    label: 'Resources & Policies Table',
    description: 'Searchable table of HR policies, guides, and resources',
    configSchema: blockSchemas.resources_policies_table.shape,
  },
  {
    type: 'connected_tools_list',
    label: 'Connected Tools List',
    description: 'List of integrated enterprise tools',
    configSchema: blockSchemas.connected_tools_list.shape,
  },
  {
    type: 'infrastructure_health',
    label: 'Infrastructure Health',
    description: 'Real-time status of internal services and systems',
    configSchema: blockSchemas.infrastructure_health.shape,
  },
  {
    type: 'project_status_board',
    label: 'Project Status Board',
    description: 'Overview of active projects and milestones',
    configSchema: blockSchemas.project_status_board.shape,
  },
  {
    type: 'dept_hero_banner',
    label: 'Department Hero Banner',
    description: 'Full-width banner for department landing pages',
    configSchema: blockSchemas.dept_hero_banner.shape,
  },
  {
    type: 'alert_banner',
    label: 'Alert Banner',
    description: 'Dismissible alert or notice for urgent messages',
    configSchema: blockSchemas.alert_banner.shape,
  },
  {
    type: 'custom_link_block',
    label: 'Custom Link Block',
    description: 'Configurable grid of custom links with icons',
    configSchema: blockSchemas.custom_link_block.shape,
  },
  {
    type: 'custom_embed_block',
    label: 'Custom Embed Block',
    description: 'Embed an external URL in an iframe',
    configSchema: blockSchemas.custom_embed_block.shape,
  },
]

export function validateBlockConfig(type: BlockType, config: unknown) {
  const schema = blockSchemas[type]
  return schema.safeParse(config)
}
