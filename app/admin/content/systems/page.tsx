'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Plus,
  Upload,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { mockSystems, mockAccessRequests } from '@/lib/mock-data'
import { SystemEntry, SystemCategory, SystemStatus, AccessRequest } from '@/lib/types'
import { formatDate, cn, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog } from '@/components/ui/dialog'
import { FormField } from '@/components/ui/form-field'
import { Card } from '@/components/ui/card'

type TabView = 'directory' | 'access-requests'
type CategoryFilter = SystemCategory | 'All'
type StatusFilter = SystemStatus | 'all'

const CATEGORIES: CategoryFilter[] = [
  'All',
  'IT & Engineering',
  'HR & Benefits',
  'Finance',
  'GTM & Sales',
]

const STATUS_BADGE: Record<SystemStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' }> = {
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'default' },
  deprecated: { label: 'Deprecated', variant: 'error' },
}

const REQUEST_BADGE: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'error' },
}

interface SystemFormData {
  name: string
  url: string
  description: string
  category: SystemCategory
  status: SystemStatus
  ownerName: string
  ownerEmail: string
  ownerSlack: string
  isQuickAccess: boolean
  iconUrl: string
}

const defaultFormData: SystemFormData = {
  name: '',
  url: '',
  description: '',
  category: 'IT & Engineering',
  status: 'active',
  ownerName: '',
  ownerEmail: '',
  ownerSlack: '',
  isQuickAccess: false,
  iconUrl: '',
}

interface FormErrors {
  name?: string
  url?: string
  ownerEmail?: string
}

function validateSystemForm(data: SystemFormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = 'Name is required'
  if (!data.url.trim()) errors.url = 'URL is required'
  else if (!/^https?:\/\//.test(data.url)) errors.url = 'URL must start with http:// or https://'
  if (data.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.ownerEmail))
    errors.ownerEmail = 'Invalid email address'
  return errors
}

interface ImportRow {
  name: string
  url: string
  category: string
  description: string
}

export default function SystemsAdminPage() {
  const [systems, setSystems] = useState<SystemEntry[]>(mockSystems)
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(mockAccessRequests)

  const [tab, setTab] = useState<TabView>('directory')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SystemFormData>(defaultFormData)
  const [formErrors, setFormErrors] = useState<FormErrors>({})

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const [importStep, setImportStep] = useState<'idle' | 'preview' | 'done'>('idle')
  const [importRows, setImportRows] = useState<ImportRow[]>([])
  const [importResult, setImportResult] = useState<{ added: number; skipped: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [reviewDialogReq, setReviewDialogReq] = useState<AccessRequest | null>(null)
  const [reviewNote, setReviewNote] = useState('')

  const filteredSystems = useMemo(() => {
    return systems.filter((s) => {
      const matchCat = categoryFilter === 'All' || s.category === categoryFilter
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchStatus && matchSearch
    })
  }, [systems, categoryFilter, statusFilter, searchQuery])

  const pendingRequests = useMemo(
    () => accessRequests.filter((r) => r.status === 'pending'),
    [accessRequests]
  )

  function openCreate() {
    setEditingId(null)
    setFormData(defaultFormData)
    setFormErrors({})
    setIsFormOpen(true)
  }

  function openEdit(sys: SystemEntry) {
    setEditingId(sys.id)
    setFormData({
      name: sys.name,
      url: sys.url,
      description: sys.description,
      category: sys.category,
      status: sys.status,
      ownerName: sys.ownerName,
      ownerEmail: sys.ownerEmail,
      ownerSlack: sys.ownerSlack ?? '',
      isQuickAccess: sys.isQuickAccess,
      iconUrl: sys.iconUrl ?? '',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setFormErrors({})
  }

  function handleField<K extends keyof SystemFormData>(key: K, value: SystemFormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (formErrors[key as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [key]: undefined }))
    }
  }

  function saveSystem() {
    const errors = validateSystemForm(formData)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    const now = new Date().toISOString()
    if (editingId) {
      setSystems((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: formData.name,
                url: formData.url,
                description: formData.description,
                category: formData.category,
                status: formData.status,
                ownerName: formData.ownerName,
                ownerEmail: formData.ownerEmail,
                ownerSlack: formData.ownerSlack || undefined,
                isQuickAccess: formData.isQuickAccess,
                iconUrl: formData.iconUrl || undefined,
                updatedAt: now,
              }
            : s
        )
      )
    } else {
      const newSys: SystemEntry = {
        id: `sys-${Date.now()}`,
        name: formData.name,
        url: formData.url,
        description: formData.description,
        category: formData.category,
        status: formData.status,
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail,
        ownerSlack: formData.ownerSlack || undefined,
        isQuickAccess: formData.isQuickAccess,
        iconUrl: formData.iconUrl || undefined,
        myAccessStatus: 'none',
        createdAt: now,
        updatedAt: now,
      }
      setSystems((prev) => [newSys, ...prev])
    }
    closeForm()
  }

  function deleteSystem(id: string) {
    setSystems((prev) => prev.filter((s) => s.id !== id))
    setDeleteConfirmId(null)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').filter(Boolean)
      const rows: ImportRow[] = lines.slice(1).map((line) => {
        const [name, url, category, description] = line.split(',').map((s) => s.trim())
        return { name: name ?? '', url: url ?? '', category: category ?? '', description: description ?? '' }
      })
      setImportRows(rows.filter((r) => r.name && r.url))
      setImportStep('preview')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function executeImport() {
    const now = new Date().toISOString()
    let added = 0
    let skipped = 0
    const newSystems: SystemEntry[] = []
    for (const row of importRows) {
      const exists = systems.some((s) => s.name.toLowerCase() === row.name.toLowerCase())
      if (exists) {
        skipped++
        continue
      }
      newSystems.push({
        id: `sys-${Date.now()}-${added}`,
        name: row.name,
        url: row.url,
        description: row.description,
        category: (row.category as SystemCategory) || 'IT & Engineering',
        status: 'active',
        ownerName: 'Unassigned',
        ownerEmail: '',
        isQuickAccess: false,
        myAccessStatus: 'none',
        createdAt: now,
        updatedAt: now,
      })
      added++
    }
    setSystems((prev) => [...newSystems, ...prev])
    setImportResult({ added, skipped })
    setImportStep('done')
  }

  function resetImport() {
    setImportStep('idle')
    setImportRows([])
    setImportResult(null)
  }

  function approveRequest(req: AccessRequest, note: string) {
    const now = new Date().toISOString()
    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === req.id ? { ...r, status: 'approved', reviewNote: note, reviewedAt: now } : r
      )
    )
    setSystems((prev) =>
      prev.map((s) =>
        s.id === req.systemId ? { ...s, myAccessStatus: 'connected' } : s
      )
    )
    setReviewDialogReq(null)
    setReviewNote('')
  }

  function rejectRequest(req: AccessRequest, note: string) {
    const now = new Date().toISOString()
    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === req.id ? { ...r, status: 'rejected', reviewNote: note, reviewedAt: now } : r
      )
    )
    setReviewDialogReq(null)
    setReviewNote('')
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Systems Directory</h1>
          <p className="text-sm text-[#4b5563] mt-1">
            Manage internal tools and access requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload size={16} />
            Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button onClick={openCreate} className="gap-2">
            <Plus size={16} />
            New System
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#dee2e6]">
        {([
          { label: 'Directory', value: 'directory' as TabView },
          {
            label: `Access Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ''}`,
            value: 'access-requests' as TabView,
          },
        ] as const).map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.value
                ? 'border-primary text-primary'
                : 'border-transparent text-[#4b5563] hover:text-[#111827]'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'directory' && (
        <>
          {/* Filters row */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-btn transition-colors',
                    categoryFilter === cat
                      ? 'bg-primary text-white'
                      : 'bg-white border border-[#dee2e6] text-[#4b5563] hover:bg-[#f1f3f5]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-36"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deprecated">Deprecated</option>
            </Select>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or owner..."
              className="w-56"
            />
          </div>

          {/* Data table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#dee2e6] bg-[#f8f9fa]">
                    <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Owner</th>
                    <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Quick Access</th>
                    <th className="text-right px-4 py-3 font-medium text-[#4b5563]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSystems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-[#9ca3af]">
                        No systems found.
                      </td>
                    </tr>
                  ) : (
                    filteredSystems.map((sys) => {
                      const badge = STATUS_BADGE[sys.status]
                      return (
                        <tr
                          key={sys.id}
                          className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {sys.iconUrl ? (
                                <img
                                  src={sys.iconUrl}
                                  alt={sys.name}
                                  className="w-7 h-7 rounded object-contain bg-[#f1f3f5] p-0.5"
                                  onError={(e) => {
                                    ;(e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className="w-7 h-7 rounded bg-primary-container text-primary-on-container flex items-center justify-center text-xs font-bold">
                                  {sys.name[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-[#111827]">{sys.name}</p>
                                <p className="text-xs text-[#9ca3af]">{truncate(sys.description, 50)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#4b5563] text-xs">{sys.category}</td>
                          <td className="px-4 py-3">
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-[#4b5563]">{sys.ownerName}</td>
                          <td className="px-4 py-3">
                            {sys.isQuickAccess ? (
                              <Badge variant="info">Quick Access</Badge>
                            ) : (
                              <span className="text-[#9ca3af] text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={sys.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-[#9ca3af] hover:text-[#4b5563] transition-colors"
                                title="Open URL"
                              >
                                <ExternalLink size={14} />
                              </a>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEdit(sys)}
                                className="text-xs"
                              >
                                <Edit2 size={13} />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDeleteConfirmId(sys.id)}
                                className="text-xs text-error hover:text-error"
                              >
                                <Trash2 size={13} />
                                Delete
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

          {/* CSV Import section */}
          {importStep !== 'idle' && (
            <Card>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#111827]">CSV Import</h3>
                  <button
                    onClick={resetImport}
                    className="text-xs text-[#9ca3af] hover:text-[#4b5563] transition-colors"
                  >
                    Clear
                  </button>
                </div>

                {importStep === 'preview' && (
                  <>
                    <p className="text-sm text-[#4b5563]">
                      Preview: {importRows.length} row(s) found. Review before importing.
                    </p>
                    <div className="overflow-x-auto border border-[#dee2e6] rounded-input max-h-48">
                      <table className="w-full text-xs">
                        <thead className="bg-[#f8f9fa]">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-[#4b5563]">Name</th>
                            <th className="text-left px-3 py-2 font-medium text-[#4b5563]">URL</th>
                            <th className="text-left px-3 py-2 font-medium text-[#4b5563]">Category</th>
                            <th className="text-left px-3 py-2 font-medium text-[#4b5563]">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importRows.map((row, i) => (
                            <tr key={i} className="border-t border-[#dee2e6]">
                              <td className="px-3 py-2 text-[#111827]">{row.name}</td>
                              <td className="px-3 py-2 text-[#4b5563] truncate max-w-[160px]">{row.url}</td>
                              <td className="px-3 py-2 text-[#4b5563]">{row.category}</td>
                              <td className="px-3 py-2 text-[#9ca3af]">{truncate(row.description, 40)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={resetImport}>
                        Cancel
                      </Button>
                      <Button onClick={executeImport}>Execute Import</Button>
                    </div>
                  </>
                )}

                {importStep === 'done' && importResult && (
                  <div className="flex items-center gap-3 p-3 bg-success-container rounded-input">
                    <CheckCircle size={16} className="text-success-on-container shrink-0" />
                    <span className="text-sm text-success-on-container">
                      Import complete: {importResult.added} added, {importResult.skipped} skipped (duplicates).
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {importStep === 'idle' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#dee2e6] rounded-card p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-50 transition-colors group"
            >
              <Upload
                size={24}
                className="mx-auto text-[#9ca3af] group-hover:text-primary mb-2 transition-colors"
              />
              <p className="text-sm font-medium text-[#4b5563] group-hover:text-primary transition-colors">
                Drop a CSV file here, or click to browse
              </p>
              <p className="text-xs text-[#9ca3af] mt-1">
                Expected columns: name, url, category, description
              </p>
            </div>
          )}
        </>
      )}

      {tab === 'access-requests' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#dee2e6] bg-[#f8f9fa]">
                  <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Requester</th>
                  <th className="text-left px-4 py-3 font-medium text-[#4b5563]">System</th>
                  <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Note</th>
                  <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Requested</th>
                  <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-[#4b5563]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-[#9ca3af]">
                      No access requests.
                    </td>
                  </tr>
                ) : (
                  accessRequests.map((req) => {
                    const badge = REQUEST_BADGE[req.status]
                    return (
                      <tr
                        key={req.id}
                        className="border-b border-[#dee2e6] hover:bg-[#f8f9fa] transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#111827]">{req.requesterName}</p>
                          <p className="text-xs text-[#9ca3af]">{req.requesterEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-[#4b5563]">{req.systemName}</td>
                        <td className="px-4 py-3 text-[#4b5563] text-xs max-w-[200px]">
                          {req.note ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-[#9ca3af] text-xs font-mono">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          {req.reviewNote && (
                            <p className="text-xs text-[#9ca3af] mt-0.5">{req.reviewNote}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {req.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setReviewDialogReq(req)
                                  setReviewNote('')
                                }}
                              >
                                <CheckCircle size={13} />
                                Review
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create / Edit system modal */}
      <Dialog
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingId ? 'Edit System' : 'New System'}
        className="max-w-2xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Name" required error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => handleField('name', e.target.value)}
                placeholder="e.g. Slack"
                error={formErrors.name}
              />
            </FormField>
            <FormField label="URL" required error={formErrors.url}>
              <Input
                value={formData.url}
                onChange={(e) => handleField('url', e.target.value)}
                placeholder="https://"
                error={formErrors.url}
              />
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => handleField('description', e.target.value)}
              placeholder="Brief description of this tool..."
              rows={3}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category">
              <Select
                value={formData.category}
                onChange={(e) => handleField('category', e.target.value as SystemCategory)}
              >
                <option value="IT & Engineering">IT & Engineering</option>
                <option value="HR & Benefits">HR & Benefits</option>
                <option value="Finance">Finance</option>
                <option value="GTM & Sales">GTM & Sales</option>
                <option value="Operations">Operations</option>
              </Select>
            </FormField>
            <FormField label="Status">
              <Select
                value={formData.status}
                onChange={(e) => handleField('status', e.target.value as SystemStatus)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deprecated">Deprecated</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Owner Name">
              <Input
                value={formData.ownerName}
                onChange={(e) => handleField('ownerName', e.target.value)}
                placeholder="e.g. IT Team"
              />
            </FormField>
            <FormField label="Owner Email" error={formErrors.ownerEmail}>
              <Input
                value={formData.ownerEmail}
                onChange={(e) => handleField('ownerEmail', e.target.value)}
                placeholder="it@company.com"
                error={formErrors.ownerEmail}
              />
            </FormField>
          </div>

          <FormField label="Owner Slack" hint="Optional">
            <Input
              value={formData.ownerSlack}
              onChange={(e) => handleField('ownerSlack', e.target.value)}
              placeholder="@it-support"
            />
          </FormField>

          <FormField
            label="Icon URL"
            hint="Paste a direct image URL to show a logo"
          >
            <Input
              value={formData.iconUrl}
              onChange={(e) => handleField('iconUrl', e.target.value)}
              placeholder="https://example.com/icon.png"
            />
            {formData.iconUrl && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={formData.iconUrl}
                  alt="Icon preview"
                  className="w-8 h-8 rounded object-contain border border-[#dee2e6] p-0.5"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <span className="text-xs text-[#9ca3af]">Preview</span>
              </div>
            )}
          </FormField>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isQuickAccess}
              onChange={(e) => handleField('isQuickAccess', e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm text-[#111827]">Featured in Quick Access</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-[#dee2e6]">
          <Button variant="ghost" onClick={closeForm}>
            Cancel
          </Button>
          <Button onClick={saveSystem}>{editingId ? 'Save Changes' : 'Create System'}</Button>
        </div>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete System"
      >
        <div className="space-y-4">
          <div className="flex gap-3 p-3 bg-error-container rounded-input">
            <AlertTriangle size={16} className="text-error-on-container shrink-0 mt-0.5" />
            <p className="text-sm text-error-on-container">
              This action cannot be undone. The system entry and all associated data will be
              permanently deleted.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#dee2e6]">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirmId && deleteSystem(deleteConfirmId)}
            >
              Delete System
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Access request review dialog */}
      <Dialog
        isOpen={!!reviewDialogReq}
        onClose={() => {
          setReviewDialogReq(null)
          setReviewNote('')
        }}
        title="Review Access Request"
      >
        {reviewDialogReq && (
          <div className="space-y-4">
            <div className="p-3 bg-[#f8f9fa] rounded-input space-y-1 text-sm">
              <p>
                <span className="font-medium text-[#111827]">Requester:</span>{' '}
                <span className="text-[#4b5563]">
                  {reviewDialogReq.requesterName} ({reviewDialogReq.requesterEmail})
                </span>
              </p>
              <p>
                <span className="font-medium text-[#111827]">System:</span>{' '}
                <span className="text-[#4b5563]">{reviewDialogReq.systemName}</span>
              </p>
              {reviewDialogReq.note && (
                <p>
                  <span className="font-medium text-[#111827]">Reason:</span>{' '}
                  <span className="text-[#4b5563]">{reviewDialogReq.note}</span>
                </p>
              )}
            </div>
            <FormField label="Review Note" hint="Optional — visible to requester">
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add a note about this decision..."
                rows={3}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#dee2e6]">
              <Button
                variant="ghost"
                onClick={() => {
                  setReviewDialogReq(null)
                  setReviewNote('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => rejectRequest(reviewDialogReq, reviewNote)}
              >
                <XCircle size={14} />
                Reject
              </Button>
              <Button onClick={() => approveRequest(reviewDialogReq, reviewNote)}>
                <CheckCircle size={14} />
                Approve
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
