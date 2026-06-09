-- SNOW-187: Google SSO + Full Schema + RBAC
-- This migration replaces the Spike db-push state with proper tracked migrations.
-- Applying to a fresh DB: run this once.
-- Applying to an existing Spike DB: see "Upgrading from Spike" note at the bottom.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'PUBLISHER', 'DEPT_ADMIN', 'SYSTEM_OWNER', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AudienceScope" AS ENUM ('ALL', 'DEPARTMENT', 'GROUP');

-- CreateEnum
CREATE TYPE "PageLayoutStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable Account
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable VerificationToken
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "googleId" TEXT,
    "role" "Role" NOT NULL DEFAULT 'EMPLOYEE',
    "deptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable Department
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "googleGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable _DeptAdmins (Department.admins <-> User.adminOfDepts many-to-many)
CREATE TABLE "_DeptAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable Announcement
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "departmentId" TEXT,
    "audienceScope" "AudienceScope" NOT NULL DEFAULT 'ALL',
    "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable AnnouncementRead
CREATE TABLE "AnnouncementRead" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AnnouncementRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable SystemEntry
CREATE TABLE "SystemEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "iconUrl" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "ownerName" TEXT NOT NULL,
    "ownerEmail" TEXT,
    "ownerSlack" TEXT,
    "isQuickAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SystemEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable portal_pages
CREATE TABLE "portal_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "page_type" TEXT NOT NULL DEFAULT 'home',
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "portal_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable page_layouts
CREATE TABLE "page_layouts" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "blocks" JSONB NOT NULL,
    "status" "PageLayoutStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "created_by" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "page_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "Department_slug_key" ON "Department"("slug");
CREATE UNIQUE INDEX "_DeptAdmins_AB_unique" ON "_DeptAdmins"("A", "B");
CREATE INDEX "_DeptAdmins_B_index" ON "_DeptAdmins"("B");
CREATE UNIQUE INDEX "AnnouncementRead_announcementId_userId_key" ON "AnnouncementRead"("announcementId", "userId");
CREATE UNIQUE INDEX "portal_pages_slug_key" ON "portal_pages"("slug");
CREATE UNIQUE INDEX "page_layouts_page_id_version_key" ON "page_layouts"("page_id", "version");
CREATE INDEX "page_layouts_page_id_status_idx" ON "page_layouts"("page_id", "status");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_deptId_fkey" FOREIGN KEY ("deptId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_DeptAdmins" ADD CONSTRAINT "_DeptAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_DeptAdmins" ADD CONSTRAINT "_DeptAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AnnouncementRead" ADD CONSTRAINT "AnnouncementRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "page_layouts" ADD CONSTRAINT "page_layouts_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "portal_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "page_layouts" ADD CONSTRAINT "page_layouts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =====================================================================
-- Upgrading from Spike (db-push) to this migration
-- =====================================================================
-- If you already have a database from the Spike, run this block instead
-- of the full migration above (comment out all tables above that exist):
--
--   -- 1. Create new enums
--   CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'PUBLISHER', 'DEPT_ADMIN', 'SYSTEM_OWNER', 'PLATFORM_ADMIN');
--   CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'ARCHIVED', 'EXPIRED');
--   CREATE TYPE "AudienceScope" AS ENUM ('ALL', 'DEPARTMENT', 'GROUP');
--
--   -- 2. Alter User table
--   ALTER TABLE "User" ADD COLUMN "googleId" TEXT;
--   ALTER TABLE "User" ADD COLUMN "deptId" TEXT;
--   ALTER TABLE "User" ADD COLUMN "role_new" "Role" NOT NULL DEFAULT 'EMPLOYEE';
--   UPDATE "User" SET "role_new" = 'PLATFORM_ADMIN' WHERE "role"::text = 'ADMIN';
--   UPDATE "User" SET "role_new" = 'PUBLISHER'      WHERE "role"::text = 'EDITOR';
--   ALTER TABLE "User" DROP COLUMN "role";
--   ALTER TABLE "User" RENAME COLUMN "role_new" TO "role";
--   DROP TYPE "UserRole";
--   CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
--
--   -- 3. Create Department, Announcement, AnnouncementRead, SystemEntry tables
--   -- (run the CREATE TABLE + FK statements above for those tables only)
-- =====================================================================
