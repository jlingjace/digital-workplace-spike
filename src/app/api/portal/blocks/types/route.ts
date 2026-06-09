import { NextResponse } from 'next/server'
import { blockTypeDefinitions } from '@/lib/blocks/registry'

// GET /api/portal/blocks/types — public; returns all 14 block type definitions
export async function GET() {
  return NextResponse.json(blockTypeDefinitions, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
