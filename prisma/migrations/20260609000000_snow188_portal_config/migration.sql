-- Migration: SNOW-188 Portal Config API
-- Changes: UserRole enum update (EMPLOYEE/PUBLISHER/DEPT_ADMIN/SYSTEM_OWNER/PLATFORM_ADMIN),
--          add googleId + deptId to User, GIN index on page_layouts.blocks

-- Step 1: Add new enum values to UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EMPLOYEE';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PUBLISHER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DEPT_ADMIN';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SYSTEM_OWNER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PLATFORM_ADMIN';

-- Step 2: Migrate existing roles (ADMIN → PLATFORM_ADMIN, EDITOR → PUBLISHER, VIEWER → EMPLOYEE)
UPDATE "User" SET role = 'PLATFORM_ADMIN' WHERE role = 'ADMIN';
UPDATE "User" SET role = 'PUBLISHER' WHERE role = 'EDITOR';
UPDATE "User" SET role = 'EMPLOYEE' WHERE role = 'VIEWER';

-- Step 3: Add new columns to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "deptId" TEXT;

-- Step 4: Add unique index on googleId
CREATE UNIQUE INDEX IF NOT EXISTS "User_googleId_key" ON "User"("googleId");

-- Step 5: GIN index for JSONB blocks column (not supported natively by Prisma)
CREATE INDEX IF NOT EXISTS "idx_page_layouts_blocks_gin" ON "page_layouts" USING GIN("blocks");
