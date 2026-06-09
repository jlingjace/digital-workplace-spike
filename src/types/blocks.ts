export type BlockType =
  | 'announcements_feed'
  | 'quick_access_grid'
  | 'action_items_list'
  | 'events_calendar'
  | 'news_culture_cards'
  | 'team_directory'
  | 'resources_policies_table'
  | 'connected_tools_list'
  | 'infrastructure_health'
  | 'project_status_board'
  | 'dept_hero_banner'
  | 'alert_banner'
  | 'custom_link_block'
  | 'custom_embed_block'

export interface Block {
  id: string
  type: BlockType
  position: number
  visible: boolean
  config: Record<string, unknown>
}

export interface BlockTypeDefinition {
  type: BlockType
  label: string
  description: string
  configSchema: Record<string, unknown>
}

export interface PageLayoutData {
  id: string
  pageId: string
  version: number
  blocks: Block[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdAt: string
}
