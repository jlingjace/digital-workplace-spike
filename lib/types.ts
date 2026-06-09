export type AnnouncementStatus = 'draft' | 'pending' | 'published' | 'archived' | 'expired'
export type UserRole = 'employee' | 'dept_admin' | 'platform_admin'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type SystemStatus = 'active' | 'inactive' | 'deprecated'
export type SystemCategory = 'IT & Engineering' | 'HR & Benefits' | 'Finance' | 'GTM & Sales' | 'Operations' | 'All'

export interface Announcement {
  id: string
  title: string
  content: string
  department: string
  audience: 'all' | 'dept' | 'group'
  audienceTarget?: string
  status: AnnouncementStatus
  isPinned: boolean
  isMandatoryRead: boolean
  contactName?: string
  contactSlack?: string
  publishedAt?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
  readCount?: number
  totalAudience?: number
}

export interface SystemEntry {
  id: string
  name: string
  description: string
  url: string
  iconUrl?: string
  category: SystemCategory
  status: SystemStatus
  ownerName: string
  ownerEmail: string
  ownerSlack?: string
  isQuickAccess: boolean
  myAccessStatus?: 'none' | 'pending' | 'connected'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department: string
  avatarUrl?: string
  createdAt: string
}

export interface AccessRequest {
  id: string
  systemId: string
  systemName: string
  requesterName: string
  requesterEmail: string
  status: RequestStatus
  note?: string
  reviewNote?: string
  createdAt: string
  reviewedAt?: string
}
