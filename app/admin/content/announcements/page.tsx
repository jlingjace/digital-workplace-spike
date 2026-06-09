'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit2, Archive, Pin, Bell, Send, CheckCircle, XCircle, Users } from 'lucide-react'
import { mockAnnouncements } from '@/lib/mock-data'
import { Announcement, AnnouncementStatus } from '@/lib/types'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

type StatusFilter = 'all' | AnnouncementStatus

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
  { label: 'Expired', value: 'expired' },
]

const STATUS_BADGE: Record<AnnouncementStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' }> = {
  draft: { label: 'Draft', variant: 'default' },
  pending: { label: 'Pending', variant: 'warning' },
  published: { label: 'Published', variant: 'success' },
  archived: { label: 'Archived', variant: 'secondary' },
  expired: { label: 'Expired', variant: 'error' },
}

const DEPARTMENTS = ['IT', 'People', 'GTM', 'Finance', 'Engineering', 'All']

interface AnnouncementFormData {
  title: string
  content: string
  department: string
  audience: 'all' | 'dept' | 'group'
  audienceTarget: string
  expiresAt: string
  isPinned: boolean
  isMandatoryRead: boolean
  contactName: string
  contactSlack: string
}

const defaultFormData: AnnouncementFormData = {
  title: '',
  content: '',
  department: 'IT',
  audience: 'all',
  audienceTarget: '',
  expiresAt: '',
  isPinned: false,
  isMandatoryRead: false,
  contactName: '',
  contactSlack: '',
}

interface FormErrors {
  title?: string
  content?: string
  department?: string
}

function validateForm(data: AnnouncementFormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.title.trim()) errors.title = 'Title is required'
  if (!data.content.trim()) errors.content = 'Content is required'
  if (!data.department) errors.department = 'Department is required'
  return errors
}

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnnouncementFormData>(defaultFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [reminderSent, setReminderSent] = useState<string | null>(null)
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState('')

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return announcements
    return announcements.filter((a) => a.status === statusFilter)
  }, [announcements, statusFilter])

  function openCreate() {
    setEditingId(null)
    setFormData(defaultFormData)
    setFormErrors({})
    setIsModalOpen(true)
  }

  function openEdit(ann: Announcement) {
    setEditingId(ann.id)
    setFormData({
      title: ann.title,
      content: ann.content,
      department: ann.department,
      audience: ann.audience,
      audienceTarget: ann.audienceTarget ?? '',
      expiresAt: ann.expiresAt ? ann.expiresAt.slice(0, 10) : '',
      isPinned: ann.isPinned,
      isMandatoryRead: ann.isMandatoryRead,
      contactName: ann.contactName ?? '',
      contactSlack: ann.contactSlack ?? '',
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setEditingId(null)
    setFormErrors({})
  }

  function handleFieldChange<K extends keyof AnnouncementFormData>(
    key: K,
    value: AnnouncementFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function saveDraft() {
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    persistAnnouncement('draft')
    closeModal()
  }

  function submitForApproval() {
    const errors = validateForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    persistAnnouncement('pending')
    closeModal()
  }

  function persistAnnouncement(status: AnnouncementStatus) {
    const now = new Date().toISOString()
    if (editingId) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                title: formData.title,
                content: formData.content,
                department: formData.department,
                audience: formData.audience,
                audienceTarget: formData.audienceTarget || undefined,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
                isPinned: formData.isPinned,
                isMandatoryRead: formData.isMandatoryRead,
                contactName: formData.contactName || undefined,
                contactSlack: formData.contactSlack || undefined,
                status,
                updatedAt: now,
              }
            : a
        )
      )
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: formData.title,
        content: formData.content,
        department: formData.department,
        audience: formData.audience,
        audienceTarget: formData.audienceTarget || undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        isPinned: formData.isPinned,
        isMandatoryRead: formData.isMandatoryRead,
        contactName: formData.contactName || undefined,
        contactSlack: formData.contactSlack || undefined,
        status,
        createdAt: now,
        updatedAt: now,
      }
      setAnnouncements((prev) => [newAnn, ...prev])
    }
  }

  function publishAnnouncement(id: string) {
    const now = new Date().toISOString()
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'published', publishedAt: now, updatedAt: now } : a
      )
    )
  }

  function archiveAnnouncement(id: string) {
    const now = new Date().toISOString()
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'archived', updatedAt: now } : a
      )
    )
  }

  function rejectAnnouncement(id: string) {
    const now = new Date().toISOString()
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'draft', updatedAt: now } : a
      )
    )
    setRejectDialogId(null)
    setRejectNote('')
  }

  function sendReminder(id: string) {
    setReminderSent(id)
    setTimeout(() => setReminderSent(null), 2000)
  }

  const editingAnn = editingId ? announcements.find((a) => a.id === editingId) : null

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Announcements</h1>
          <p className="text-sm text-[#4b5563] mt-1">
            Manage and publish company-wide and department announcements
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus size={16} />
          New Announcement
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-[#dee2e6]">
        {STATUS_FILTERS.map((f) => {
          const count =
            f.value === 'all'
              ? announcements.length
              : announcements.filter((a) => a.status === f.value).length
          return (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                statusFilter === f.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[#4b5563] hover:text-[#111827]'
              )}
            >
              {f.label}
              <span
                className={cn(
                  'ml-1.5 px-1.5 py-0.5 rounded text-xs',
                  statusFilter === f.value
                    ? 'bg-primary-container text-primary-on-container'
                    : 'bg-[#f1f3f5] text-[#4b5563]'
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Data table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee2e6] bg-[#f8f9fa]">
                <th className="text-left px-4 py-3 font-medium text-[#4b5563] w-[35%]">Title</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Status</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Department</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Published</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Mandatory</th>
                <th className="text-right px-4 py-3 font-medium text-[#4b5563]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#9ca3af]">
                    No announcements found.
                  </td>
                </tr>
              ) : (
                filtered.map((ann) => {
                  const badge = STATUS_BADGE[ann.status]
                  return (
                    <tr
                      key={ann.id}
                      className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-start gap-2">
                          {ann.isPinned && (
                            <Pin size={13} className="text-primary mt-0.5 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-[#111827] leading-tight">{ann.title}</p>
                            {ann.isMandatoryRead && ann.readCount !== undefined && ann.totalAudience && (
                              <p className="text-xs text-[#9ca3af] mt-0.5">
                                {ann.readCount}/{ann.totalAudience} read
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-[#4b5563]">{ann.department}</td>
                      <td className="px-4 py-3 text-[#4b5563] font-mono text-xs">
                        {ann.publishedAt ? formatDate(ann.publishedAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {ann.isMandatoryRead ? (
                          <Badge variant="error">Required</Badge>
                        ) : (
                          <span className="text-[#9ca3af] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {/* Status-based actions */}
                          {ann.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => publishAnnouncement(ann.id)}
                                className="text-xs"
                              >
                                <CheckCircle size={13} />
                                Publish
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setRejectDialogId(ann.id)
                                  setRejectNote('')
                                }}
                                className="text-xs"
                              >
                                <XCircle size={13} />
                                Reject
                              </Button>
                            </>
                          )}
                          {ann.status === 'published' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => archiveAnnouncement(ann.id)}
                              className="text-xs"
                            >
                              <Archive size={13} />
                              Archive
                            </Button>
                          )}
                          {ann.status === 'published' && ann.isMandatoryRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => sendReminder(ann.id)}
                              className="text-xs"
                              disabled={reminderSent === ann.id}
                            >
                              {reminderSent === ann.id ? (
                                <>
                                  <CheckCircle size={13} className="text-success" />
                                  Sent!
                                </>
                              ) : (
                                <>
                                  <Bell size={13} />
                                  Remind
                                </>
                              )}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEdit(ann)}
                            className="text-xs"
                          >
                            <Edit2 size={13} />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Read tracking panel for mandatory-read published announcements */}
      {announcements
        .filter((a) => a.status === 'published' && a.isMandatoryRead && a.readCount !== undefined)
        .map((ann) => (
          <Card key={`tracking-${ann.id}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#4b5563]" />
                  <span className="font-medium text-[#111827] text-sm">
                    Read Tracking: {ann.title}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => sendReminder(ann.id)}
                  disabled={reminderSent === ann.id}
                >
                  {reminderSent === ann.id ? (
                    <>
                      <CheckCircle size={13} className="text-success" />
                      Reminder Sent
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Send Reminder
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-[#4b5563] mb-1">
                    <span>{ann.readCount} read</span>
                    <span>{ann.totalAudience} total</span>
                  </div>
                  <div className="h-2 bg-[#e9ecef] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${Math.round(((ann.readCount ?? 0) / (ann.totalAudience ?? 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-[#111827] tabular-nums">
                  {Math.round(((ann.readCount ?? 0) / (ann.totalAudience ?? 1)) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

      {/* Create/Edit modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Announcement' : 'New Announcement'}
        className="max-w-2xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <FormField label="Title" required error={formErrors.title}>
            <Input
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Announcement title"
              error={formErrors.title}
            />
          </FormField>

          <FormField
            label="Content"
            required
            error={formErrors.content}
            hint="[Rich Text Editor - Tiptap integration pending]"
          >
            <Textarea
              value={formData.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              placeholder="Write your announcement content here..."
              rows={6}
              error={formErrors.content}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Department" required error={formErrors.department}>
              <Select
                value={formData.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                error={formErrors.department}
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Expires At" hint="Leave blank for no expiry">
              <Input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => handleFieldChange('expiresAt', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Audience">
            <div className="flex flex-col gap-2">
              {(['all', 'dept', 'group'] as const).map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audience"
                    value={val}
                    checked={formData.audience === val}
                    onChange={() => handleFieldChange('audience', val)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-[#111827]">
                    {val === 'all' ? 'All Employees' : val === 'dept' ? 'Department' : 'Group'}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          {(formData.audience === 'dept' || formData.audience === 'group') && (
            <FormField
              label={formData.audience === 'dept' ? 'Target Department' : 'Target Group'}
            >
              <Input
                value={formData.audienceTarget}
                onChange={(e) => handleFieldChange('audienceTarget', e.target.value)}
                placeholder={
                  formData.audience === 'dept' ? 'e.g. Engineering' : 'e.g. New Hires 2026'
                }
              />
            </FormField>
          )}

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => handleFieldChange('isPinned', e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-[#111827]">Pin to top</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isMandatoryRead}
                onChange={(e) => handleFieldChange('isMandatoryRead', e.target.checked)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm text-[#111827]">Mandatory Read</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Name" hint="Optional">
              <Input
                value={formData.contactName}
                onChange={(e) => handleFieldChange('contactName', e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </FormField>
            <FormField label="Contact Slack" hint="Optional">
              <Input
                value={formData.contactSlack}
                onChange={(e) => handleFieldChange('contactSlack', e.target.value)}
                placeholder="e.g. @sarah-chen"
              />
            </FormField>
          </div>
        </div>

        {/* Action buttons based on editing status */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-[#dee2e6]">
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          {(!editingAnn || editingAnn.status === 'draft') && (
            <>
              <Button variant="ghost" onClick={saveDraft}>
                Save Draft
              </Button>
              <Button onClick={submitForApproval}>Submit for Approval</Button>
            </>
          )}
          {editingAnn?.status === 'pending' && (
            <>
              <Button
                variant="danger"
                onClick={() => {
                  closeModal()
                  setRejectDialogId(editingAnn.id)
                  setRejectNote('')
                }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  publishAnnouncement(editingAnn.id)
                  closeModal()
                }}
              >
                Approve & Publish
              </Button>
            </>
          )}
          {editingAnn?.status === 'published' && (
            <Button
              variant="ghost"
              onClick={() => {
                archiveAnnouncement(editingAnn.id)
                closeModal()
              }}
            >
              Archive
            </Button>
          )}
          {editingAnn?.status === 'archived' && (
            <Button onClick={saveDraft}>Save Changes</Button>
          )}
        </div>
      </Dialog>

      {/* Reject dialog */}
      <Dialog
        isOpen={!!rejectDialogId}
        onClose={() => {
          setRejectDialogId(null)
          setRejectNote('')
        }}
        title="Reject Announcement"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#4b5563]">
            This will return the announcement to Draft status. Provide a reason for the rejection.
          </p>
          <FormField label="Rejection Note" hint="Optional — will be visible to the author">
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Explain why this announcement needs changes..."
              rows={3}
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#dee2e6]">
            <Button
              variant="ghost"
              onClick={() => {
                setRejectDialogId(null)
                setRejectNote('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => rejectDialogId && rejectAnnouncement(rejectDialogId)}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
