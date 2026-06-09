import { UserRole } from '@prisma/client'
import type { Session } from 'next-auth'

const roleHierarchy: UserRole[] = [
  UserRole.EMPLOYEE,
  UserRole.PUBLISHER,
  UserRole.DEPT_ADMIN,
  UserRole.SYSTEM_OWNER,
  UserRole.PLATFORM_ADMIN,
]

export function hasRole(session: Session | null, role: UserRole): boolean {
  if (!session?.user?.role) return false
  const userLevel = roleHierarchy.indexOf(session.user.role as UserRole)
  const requiredLevel = roleHierarchy.indexOf(role)
  return userLevel >= requiredLevel
}

export function isPlatformAdmin(session: Session | null): boolean {
  return session?.user?.role === UserRole.PLATFORM_ADMIN
}

export function canManagePortalConfig(session: Session | null): boolean {
  return isPlatformAdmin(session)
}

export function canPublishAnnouncement(
  session: Session | null,
  departmentId?: string
): boolean {
  if (!session?.user?.role) return false
  const role = session.user.role as UserRole
  if (role === UserRole.PLATFORM_ADMIN || role === UserRole.SYSTEM_OWNER) return true
  if (role === UserRole.PUBLISHER) return true
  if (role === UserRole.DEPT_ADMIN && departmentId) {
    return (session.user as any).deptId === departmentId
  }
  return false
}

export function canManageSystemEntry(session: Session | null): boolean {
  if (!session?.user?.role) return false
  const role = session.user.role as UserRole
  return role === UserRole.PLATFORM_ADMIN || role === UserRole.SYSTEM_OWNER
}
