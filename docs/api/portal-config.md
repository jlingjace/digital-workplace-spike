# Portal Config API — Contract Documentation

> Issue: SNOW-188 | Author: BE Developer | Date: 2026-06-09

## Overview

The Portal Config API manages the Block Editor layout system for Digital Workplace.
Two sets of endpoints are provided:

- **Frontend API** (`/api/portal/**`): Public, cached, no auth required.
- **Admin API** (`/api/admin/**`): Requires an active session with `role = PLATFORM_ADMIN`.

---

## Authentication

| Route prefix | Auth required | Role check |
|---|---|---|
| `/api/portal/**` | None | — |
| `/api/admin/**` | Yes (NextAuth session via cookie) | `PLATFORM_ADMIN` only |

Unauthenticated requests to admin routes → `401 Unauthorized` (middleware redirect to sign-in).
Authenticated but wrong role → `403 Forbidden`.

---

## Frontend API

### `GET /api/portal/pages/[slug]/layout`

Returns the published layout for a portal page.

**Path params:**
- `slug` — page slug (e.g. `home`, `dept/hr`)

**Response `200`:**
```json
{
  "blocks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "announcements_feed",
      "position": 0,
      "visible": true,
      "config": {
        "title": "Latest Announcements",
        "count": 5,
        "showImages": true,
        "audienceScope": "all"
      }
    }
  ]
}
```

If no published layout exists: `{ "blocks": [] }` (still `200`, not `404`).

**Cache headers:** `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`

---

### `GET /api/portal/blocks/types`

Returns definitions for all 14 supported block types.

**Response `200`:**
```json
[
  {
    "type": "announcements_feed",
    "label": "Announcements Feed",
    "description": "Displays a list of company or department announcements",
    "configSchema": { ... }
  }
]
```

**Cache headers:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`

---

## Admin API

All admin endpoints are guarded by `middleware.ts`:  
matcher: `['/admin/:path*', '/api/admin/:path*']`

### `GET /api/admin/pages`

Returns all portal pages with their current draft/published layout status.

**Response `200`:**
```json
[
  {
    "id": "clxyz...",
    "slug": "home",
    "pageType": "home",
    "title": "Corporate Portal Home",
    "createdAt": "2026-06-09T00:00:00Z",
    "updatedAt": "2026-06-09T00:00:00Z",
    "layouts": [
      {
        "id": "clxyz...",
        "version": 3,
        "status": "PUBLISHED",
        "publishedAt": "2026-06-09T12:00:00Z",
        "createdAt": "2026-06-09T10:00:00Z"
      }
    ]
  }
]
```

---

### `GET /api/admin/pages/[id]/layout/current`

Returns the current **draft** layout for a page, or `null` if none exists.

**Path params:**
- `id` — portal page cuid

**Response `200`:** `PageLayout` object or `null`

---

### `PUT /api/admin/pages/[id]/layout/draft`

Saves the current draft. Creates a new draft if none exists, or updates the existing one.
Uses optimistic locking via `versionId` to prevent concurrent edits from silently overwriting each other.

**Request body:**
```json
{
  "blocks": [Block],
  "versionId": "optional-current-draft-cuid"
}
```

- `blocks[].id` must be a valid UUID (use `crypto.randomUUID()` on the frontend).
- `versionId` (optional): the `id` of the draft last loaded by the client. If the server's current draft has a different `id` (meaning another user saved in between), the server rejects with `409`.

**Response `200`:** Updated `PageLayout`

**Response `400`:** Validation error
```json
{ "error": "Invalid request body", "details": { ... } }
```

**Response `409`:** Optimistic lock conflict
```json
{
  "error": "Conflict: draft has been modified by another user. Please refresh and retry.",
  "code": "OPTIMISTIC_LOCK_CONFLICT"
}
```

---

### `POST /api/admin/pages/[id]/layout/publish`

Publishes the current draft:
1. Moves existing `PUBLISHED` → `ARCHIVED`
2. Moves current `DRAFT` → `PUBLISHED`
3. Enforces max 5 archived versions (oldest deleted when exceeded)
4. Calls `revalidatePath` on the page slug and API endpoint to invalidate ISR cache

**Response `200`:** Published `PageLayout`

**Response `404`:** No draft to publish
```json
{ "error": "No draft to publish" }
```

---

### `POST /api/admin/pages/[id]/layout/rollback`

Creates a new draft from the blocks of an archived version.
Any existing draft is removed before creating the rollback draft.

**Request body:**
```json
{ "versionId": "target-archived-layout-cuid" }
```

**Response `200`:** New `PageLayout` (status=`DRAFT`)

**Response `404`:** Target version not found or not archived
```json
{ "error": "Target version not found or not in archived status" }
```

---

### `GET /api/admin/pages/[id]/layout/versions`

Returns the most recent archived versions for a page (up to 5).

**Response `200`:** Array of partial `PageLayout` objects (ordered by version desc):
```json
[
  {
    "id": "clxyz...",
    "version": 4,
    "status": "ARCHIVED",
    "publishedAt": "2026-06-08T10:00:00Z",
    "createdAt": "2026-06-08T09:00:00Z"
  }
]
```

---

## Data Types

### `Block`
```typescript
interface Block {
  id: string          // UUID (crypto.randomUUID() — NOT Date.now())
  type: BlockType     // one of 14 block types (see below)
  position: number    // sort order (0-indexed integer)
  visible: boolean    // whether rendered in frontend
  config: object      // type-specific configuration (validated server-side by Zod)
}
```

### `PageLayout`
```typescript
interface PageLayout {
  id: string
  pageId: string
  version: number
  blocks: Block[]
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
}
```

### `BlockType` (14 types)
```
announcements_feed     quick_access_grid      action_items_list
events_calendar        news_culture_cards     team_directory
resources_policies_table  connected_tools_list  infrastructure_health
project_status_board   dept_hero_banner       alert_banner
custom_link_block      custom_embed_block
```

---

## Version Control Rules

| Action | Behaviour |
|--------|-----------|
| `PUT /draft` (no draft exists) | Creates new draft; `version = max_existing_version + 1` |
| `PUT /draft` (draft exists, no `versionId`) | Updates existing draft in-place; version unchanged |
| `PUT /draft` (draft exists, `versionId` matches) | Updates existing draft |
| `PUT /draft` (draft exists, `versionId` mismatch) | `409 OPTIMISTIC_LOCK_CONFLICT` |
| `POST /publish` | `DRAFT → PUBLISHED`, old `PUBLISHED → ARCHIVED`; prune to 5 archived |
| Max archived | 5 per page; oldest version deleted automatically when exceeded |
| `POST /rollback` | Copies archived blocks to new `DRAFT`; old draft deleted; new version number |

---

## Error Summary

| HTTP | `code` field | Meaning |
|------|------------|---------|
| 400 | — | Validation error (`details` field has specifics) |
| 401 | — | Not authenticated (redirected to sign-in) |
| 403 | — | Insufficient role (requires `PLATFORM_ADMIN`) |
| 404 | — | Resource not found |
| 409 | `OPTIMISTIC_LOCK_CONFLICT` | Draft modified concurrently by another user |
| 500 | — | Internal server error |
