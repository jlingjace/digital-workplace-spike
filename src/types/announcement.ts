export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  size: number; // bytes
  mimeType: string;
}

export interface AnnouncementContactInfo {
  name: string;
  email?: string;
  phone?: string;
  department?: string;
}

export type AnnouncementStatus = "PUBLISHED" | "DRAFT";

export interface Announcement {
  id: string;
  title: string;
  /** HTML content */
  content: string;
  /** Plain-text excerpt (max ~200 chars) */
  excerpt: string;
  department: string;
  publishedBy: string;
  publishedAt: string; // ISO-8601
  expiresAt: string | null; // ISO-8601 or null
  status: AnnouncementStatus;
  /** Must-read: employee must explicitly confirm they've read this */
  isRequired: boolean;
  /** ISO-8601 timestamp when current user confirmed read; null if unread */
  readAt: string | null;
  attachments: AnnouncementAttachment[];
  contactInfo?: AnnouncementContactInfo;
}
