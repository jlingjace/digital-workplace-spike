import type { Session } from "next-auth";

export type AppRole =
  | "EMPLOYEE"
  | "PUBLISHER"
  | "DEPT_ADMIN"
  | "SYSTEM_OWNER"
  | "PLATFORM_ADMIN";

type AppSession = Session & {
  user: Session["user"] & { role?: AppRole; deptId?: string | null };
};

const ROLE_RANK: Record<AppRole, number> = {
  EMPLOYEE: 0,
  PUBLISHER: 1,
  DEPT_ADMIN: 2,
  SYSTEM_OWNER: 3,
  PLATFORM_ADMIN: 4,
};

/** Returns true when the session user holds at least the given role. */
export function hasRole(session: Session | null, role: AppRole): boolean {
  const userRole = (session as AppSession | null)?.user?.role;
  if (!userRole) return false;
  return ROLE_RANK[userRole] >= ROLE_RANK[role];
}

/**
 * Returns true when the session user may publish an announcement.
 *
 * Rules:
 * - SYSTEM_OWNER / PLATFORM_ADMIN: any department (or global)
 * - PUBLISHER: global announcements (no departmentId) OR their own department
 * - DEPT_ADMIN: only their own department (not global)
 */
export function canPublishAnnouncement(
  session: Session | null,
  departmentId?: string | null
): boolean {
  if (!session?.user) return false;
  if (hasRole(session, "SYSTEM_OWNER")) return true;

  const userRole = (session as AppSession).user.role;
  const userDeptId = (session as AppSession).user.deptId;

  if (userRole === "PUBLISHER") {
    return !departmentId || userDeptId === departmentId;
  }

  if (userRole === "DEPT_ADMIN") {
    return !!departmentId && userDeptId === departmentId;
  }

  return false;
}

/**
 * Returns true when the session user may create/update/delete a SystemEntry.
 * Only SYSTEM_OWNER and PLATFORM_ADMIN can manage the system catalog.
 */
export function canManageSystemEntry(session: Session | null): boolean {
  return hasRole(session, "SYSTEM_OWNER");
}
