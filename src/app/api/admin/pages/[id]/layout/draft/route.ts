import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { saveDraft, OptimisticLockError } from '@/lib/page-layouts'
import { validateBlockConfig } from '@/lib/blocks/registry'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import type { BlockType } from '@/types/blocks'

const BLOCK_TYPES = [
  'announcements_feed', 'quick_access_grid', 'action_items_list',
  'events_calendar', 'news_culture_cards', 'team_directory',
  'resources_policies_table', 'connected_tools_list',
  'infrastructure_health', 'project_status_board',
  'dept_hero_banner', 'alert_banner', 'custom_link_block', 'custom_embed_block',
] as const

const blockSchema = z.object({
  id: z.string().uuid('Block id must be a UUID (use crypto.randomUUID())'),
  type: z.enum(BLOCK_TYPES),
  position: z.number().int().min(0),
  visible: z.boolean(),
  config: z.record(z.unknown()),
})

const requestSchema = z.object({
  blocks: z.array(blockSchema),
  versionId: z.string().optional(),
})

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  const body = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request body', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { blocks, versionId } = parsed.data

  // Validate each block's config against its registered Zod schema
  for (const block of blocks) {
    const result = validateBlockConfig(block.type as BlockType, block.config)
    if (!result.success) {
      return NextResponse.json(
        {
          error: `Invalid config for block type "${block.type}"`,
          details: result.error.flatten(),
        },
        { status: 400 }
      )
    }
  }

  try {
    const layout = await saveDraft(
      params.id,
      blocks as any,
      session?.user?.id,
      versionId
    )
    return NextResponse.json(layout)
  } catch (err) {
    if (err instanceof OptimisticLockError) {
      return NextResponse.json(
        {
          error: 'Conflict: draft has been modified by another user. Please refresh and retry.',
          code: 'OPTIMISTIC_LOCK_CONFLICT',
        },
        { status: 409 }
      )
    }
    throw err
  }
}
