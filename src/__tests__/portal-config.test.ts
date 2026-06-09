import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock Prisma before any imports that use it
const mockFindFirst = jest.fn()
const mockFindMany = jest.fn()
const mockCreate = jest.fn()
const mockUpdate = jest.fn()
const mockUpdateMany = jest.fn()
const mockDeleteMany = jest.fn()
const mockTransaction = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    pageLayout: {
      findFirst: mockFindFirst,
      findMany: mockFindMany,
      create: mockCreate,
      update: mockUpdate,
      updateMany: mockUpdateMany,
      deleteMany: mockDeleteMany,
    },
    $transaction: mockTransaction,
  },
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

import {
  saveDraft,
  publishLayout,
  rollbackToVersion,
  getCurrentDraft,
  OptimisticLockError,
} from '@/lib/page-layouts'
import { PageLayoutStatus } from '@prisma/client'

const PAGE_ID = 'test-page-id'

const mockBlock = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  type: 'announcements_feed' as const,
  position: 0,
  visible: true,
  config: { title: 'Test', count: 5, showImages: true, audienceScope: 'all' as const },
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ─────────────────────────────────────────────────────────
// saveDraft
// ─────────────────────────────────────────────────────────

describe('saveDraft', () => {
  it('creates a new draft when no existing draft', async () => {
    mockFindFirst
      .mockResolvedValueOnce(null)          // getCurrentDraft → no draft
      .mockResolvedValueOnce({ version: 3 }) // latest version query

    const newDraft = { id: 'new-id', version: 4, status: PageLayoutStatus.DRAFT }
    mockCreate.mockResolvedValue(newDraft)

    const result = await saveDraft(PAGE_ID, [mockBlock], 'user-id')

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pageId: PAGE_ID,
        version: 4,
        status: PageLayoutStatus.DRAFT,
        createdById: 'user-id',
      }),
    })
    expect(result).toEqual(newDraft)
  })

  it('updates existing draft when no versionId provided', async () => {
    const existingDraft = { id: 'draft-id', version: 2, status: PageLayoutStatus.DRAFT }
    mockFindFirst.mockResolvedValueOnce(existingDraft)

    const updated = { ...existingDraft, blocks: [mockBlock] }
    mockUpdate.mockResolvedValue(updated)

    const result = await saveDraft(PAGE_ID, [mockBlock], 'user-id')

    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'draft-id' },
      data: expect.objectContaining({ blocks: [mockBlock] }),
    })
    expect(result).toEqual(updated)
  })

  it('updates existing draft when versionId matches current draft id', async () => {
    const existingDraft = { id: 'draft-id', version: 2, status: PageLayoutStatus.DRAFT }
    mockFindFirst.mockResolvedValueOnce(existingDraft)
    mockUpdate.mockResolvedValue(existingDraft)

    await saveDraft(PAGE_ID, [mockBlock], 'user-id', 'draft-id')
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('throws OptimisticLockError when versionId does not match current draft', async () => {
    const existingDraft = { id: 'current-id', version: 2, status: PageLayoutStatus.DRAFT }
    mockFindFirst.mockResolvedValueOnce(existingDraft)

    await expect(
      saveDraft(PAGE_ID, [mockBlock], 'user-id', 'stale-id')
    ).rejects.toThrow(OptimisticLockError)
  })
})

// ─────────────────────────────────────────────────────────
// publishLayout — archived version limit
// ─────────────────────────────────────────────────────────

describe('publishLayout — archived version cap', () => {
  it('deletes oldest archived versions when count exceeds 5 after publish', async () => {
    const draft = { id: 'draft-id', version: 7, blocks: [] }

    mockTransaction.mockImplementation(async (callback: Function) => {
      const txDeleteMany = jest.fn().mockResolvedValue({ count: 1 })
      const tx = {
        pageLayout: {
          findFirst: jest.fn().mockResolvedValue(draft),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockResolvedValue({ ...draft, status: PageLayoutStatus.PUBLISHED }),
          findMany: jest.fn().mockResolvedValue([
            { id: 'a1' }, { id: 'a2' }, { id: 'a3' },
            { id: 'a4' }, { id: 'a5' }, { id: 'a6' }, // 6 archived → need to delete 1
          ]),
          deleteMany: txDeleteMany,
        },
      }
      const result = await callback(tx)
      // The oldest version (slice at index 5) should be deleted
      expect(txDeleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['a6'] } },
      })
      return result
    })

    await publishLayout(PAGE_ID, 'home')
    expect(mockTransaction).toHaveBeenCalled()
  })

  it('does not call deleteMany when archived count is exactly 5', async () => {
    const draft = { id: 'draft-id', version: 6, blocks: [] }

    mockTransaction.mockImplementation(async (callback: Function) => {
      const txDeleteMany = jest.fn()
      const tx = {
        pageLayout: {
          findFirst: jest.fn().mockResolvedValue(draft),
          updateMany: jest.fn().mockResolvedValue({ count: 1 }),
          update: jest.fn().mockResolvedValue({ ...draft, status: PageLayoutStatus.PUBLISHED }),
          findMany: jest.fn().mockResolvedValue([
            { id: 'a1' }, { id: 'a2' }, { id: 'a3' }, { id: 'a4' }, { id: 'a5' },
          ]),
          deleteMany: txDeleteMany,
        },
      }
      const result = await callback(tx)
      expect(txDeleteMany).not.toHaveBeenCalled()
      return result
    })

    await publishLayout(PAGE_ID, 'home')
    expect(mockTransaction).toHaveBeenCalled()
  })

  it('throws when there is no draft to publish', async () => {
    mockTransaction.mockImplementation(async (callback: Function) => {
      const tx = {
        pageLayout: {
          findFirst: jest.fn().mockResolvedValue(null), // no draft
          updateMany: jest.fn(),
          update: jest.fn(),
          findMany: jest.fn(),
          deleteMany: jest.fn(),
        },
      }
      return callback(tx)
    })

    await expect(publishLayout(PAGE_ID, 'home')).rejects.toThrow('No draft to publish')
  })
})

// ─────────────────────────────────────────────────────────
// rollbackToVersion
// ─────────────────────────────────────────────────────────

describe('rollbackToVersion', () => {
  it('creates a new draft with blocks from the target archived version', async () => {
    const targetVersion = {
      id: 'target-id',
      pageId: PAGE_ID,
      version: 3,
      status: PageLayoutStatus.ARCHIVED,
      blocks: [mockBlock],
    }

    mockFindFirst
      .mockResolvedValueOnce(targetVersion) // find archived target
      .mockResolvedValueOnce({ version: 5 }) // latest version

    mockDeleteMany.mockResolvedValue({ count: 0 })
    const newDraft = { id: 'new-draft', version: 6, status: PageLayoutStatus.DRAFT, blocks: targetVersion.blocks }
    mockCreate.mockResolvedValue(newDraft)

    const result = await rollbackToVersion(PAGE_ID, 'target-id')

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        pageId: PAGE_ID,
        blocks: targetVersion.blocks,
        status: PageLayoutStatus.DRAFT,
        createdById: null,
      }),
    })
    expect(result).toEqual(newDraft)
  })

  it('throws when target version does not exist', async () => {
    mockFindFirst.mockResolvedValueOnce(null)

    await expect(rollbackToVersion(PAGE_ID, 'nonexistent-id')).rejects.toThrow(
      'Target version not found or not in archived status'
    )
  })

  it('throws when target version is not archived (returns null from ARCHIVED filter)', async () => {
    mockFindFirst.mockResolvedValueOnce(null) // the query filters by ARCHIVED status

    await expect(rollbackToVersion(PAGE_ID, 'published-version-id')).rejects.toThrow(
      'Target version not found or not in archived status'
    )
  })
})

// ─────────────────────────────────────────────────────────
// Optimistic lock — concurrent PUT scenario
// ─────────────────────────────────────────────────────────

describe('optimistic lock — concurrent PUT', () => {
  it('second PUT with a stale versionId (different from current draft id) returns OptimisticLockError', async () => {
    // Scenario: first user saved the draft, getting id='new-id'
    // Second user is still holding old versionId='old-id'
    const currentDraft = { id: 'new-id', version: 2, status: PageLayoutStatus.DRAFT }
    mockFindFirst.mockResolvedValue(currentDraft)

    await expect(
      saveDraft(PAGE_ID, [mockBlock], 'user-b', 'old-id')
    ).rejects.toThrow(OptimisticLockError)
  })
})
