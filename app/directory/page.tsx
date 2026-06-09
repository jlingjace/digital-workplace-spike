'use client'

import { useState, useMemo } from 'react'
import { Search, ExternalLink, CheckCircle, Clock, ChevronRight, MessageSquare } from 'lucide-react'
import { mockSystems } from '@/lib/mock-data'
import { SystemEntry, SystemCategory } from '@/lib/types'
import { cn, truncate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'

type CategoryFilter = SystemCategory | 'All'

const CATEGORY_TABS: CategoryFilter[] = [
  'All',
  'IT & Engineering',
  'HR & Benefits',
  'Finance',
  'GTM & Sales',
]

const CATEGORY_COLORS: Record<string, string> = {
  'IT & Engineering': 'bg-secondary-container text-secondary-on-container',
  'HR & Benefits': 'bg-tertiary-container text-tertiary-on-container',
  Finance: 'bg-success-container text-success-on-container',
  'GTM & Sales': 'bg-primary-container text-primary-on-container',
  Operations: 'bg-info-container text-info-on-container',
}

const QUICK_ACCESS_HIGHLIGHTS = [
  {
    label: 'SSO Login',
    description: 'Sign in with Slack',
    icon: '🔐',
    bg: 'bg-secondary-container',
    textColor: 'text-secondary-on-container',
  },
  {
    label: 'Service Desk',
    description: 'IT support & tickets',
    icon: '🛠️',
    bg: 'bg-tertiary-container',
    textColor: 'text-tertiary-on-container',
  },
  {
    label: 'Finance Systems',
    description: 'Expenses & invoices',
    icon: '💰',
    bg: 'bg-success-container',
    textColor: 'text-success-on-container',
  },
  {
    label: 'HR Portal',
    description: 'Benefits & payroll',
    icon: '👥',
    bg: 'bg-primary-container',
    textColor: 'text-primary-on-container',
  },
]

function SystemIcon({ sys }: { sys: SystemEntry }) {
  const initials = sys.name.slice(0, 2).toUpperCase()
  const colorClasses = [
    'bg-primary-container text-primary-on-container',
    'bg-secondary-container text-secondary-on-container',
    'bg-tertiary-container text-tertiary-on-container',
    'bg-success-container text-success-on-container',
    'bg-info-container text-info-on-container',
  ]
  const colorIndex = sys.name.charCodeAt(0) % colorClasses.length

  if (sys.iconUrl) {
    return (
      <img
        src={sys.iconUrl}
        alt={sys.name}
        className="w-10 h-10 rounded-lg object-contain p-1 bg-[#f1f3f5]"
        onError={(e) => {
          ;(e.target as HTMLImageElement).style.display = 'none'
          ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }
  return (
    <div
      className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold',
        colorClasses[colorIndex]
      )}
    >
      {initials}
    </div>
  )
}

interface AccessButtonProps {
  sys: SystemEntry
  onRequest: (sys: SystemEntry) => void
}

function AccessButton({ sys, onRequest }: AccessButtonProps) {
  if (sys.myAccessStatus === 'connected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success-on-container bg-success-container px-2 py-1 rounded-badge">
        <CheckCircle size={12} />
        Connected
      </span>
    )
  }
  if (sys.myAccessStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-on-container bg-warning-container px-2 py-1 rounded-badge">
        <Clock size={12} />
        Pending
      </span>
    )
  }
  return (
    <Button size="sm" variant="ghost" onClick={() => onRequest(sys)} className="text-xs">
      Request Access
    </Button>
  )
}

export default function DirectoryPage() {
  const [systems, setSystems] = useState<SystemEntry[]>(mockSystems)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [requestTarget, setRequestTarget] = useState<SystemEntry | null>(null)
  const [requestNote, setRequestNote] = useState('')
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const quickAccessSystems = useMemo(
    () => systems.filter((s) => s.isQuickAccess && s.status === 'active'),
    [systems]
  )

  const filteredSystems = useMemo(() => {
    return systems.filter((s) => {
      const matchCat = categoryFilter === 'All' || s.category === categoryFilter
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchSearch
    })
  }, [systems, categoryFilter, searchQuery])

  function openRequestDialog(sys: SystemEntry) {
    setRequestTarget(sys)
    setRequestNote('')
  }

  function handleRequestSubmit() {
    if (!requestTarget) return
    setRequestSubmitting(true)
    // Simulate async request
    setTimeout(() => {
      setSystems((prev) =>
        prev.map((s) =>
          s.id === requestTarget.id ? { ...s, myAccessStatus: 'pending' } : s
        )
      )
      setRequestSubmitting(false)
      setRequestTarget(null)
      setSuccessMsg(`Access request submitted for ${requestTarget.name}`)
      setTimeout(() => setSuccessMsg(null), 3000)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Page hero */}
      <div className="bg-white border-b border-[#dee2e6]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-[#111827]">Internal Directory</h1>
          <p className="text-[#4b5563] mt-2 text-base">
            Find and access all tools and systems used across the company
          </p>

          {/* Search */}
          <div className="mt-5 relative max-w-lg">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools, owners..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Success toast */}
        {successMsg && (
          <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-success-container text-success-on-container px-4 py-3 rounded-card shadow-elevated text-sm font-medium">
            <CheckCircle size={16} />
            {successMsg}
          </div>
        )}

        {/* Quick access capability cards */}
        <section>
          <h2 className="text-sm font-semibold text-[#4b5563] uppercase tracking-wide mb-4">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACCESS_HIGHLIGHTS.map((item) => (
              <div
                key={item.label}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-card cursor-pointer group hover:shadow-ambient transition-shadow border border-transparent hover:border-[#dee2e6]',
                  item.bg
                )}
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="min-w-0">
                  <p className={cn('font-semibold text-sm', item.textColor)}>{item.label}</p>
                  <p className={cn('text-xs opacity-75 truncate', item.textColor)}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className={cn('ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity', item.textColor)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Featured quick-access systems */}
        {quickAccessSystems.length > 0 && categoryFilter === 'All' && searchQuery === '' && (
          <section>
            <h2 className="text-sm font-semibold text-[#4b5563] uppercase tracking-wide mb-4">
              Featured Tools
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {quickAccessSystems.map((sys) => (
                <div
                  key={sys.id}
                  className="bg-white border border-[#dee2e6] rounded-card p-4 flex flex-col gap-3 hover:shadow-ambient transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <SystemIcon sys={sys} />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#111827] text-sm truncate">{sys.name}</p>
                      <span
                        className={cn(
                          'text-xs px-1.5 py-0.5 rounded-badge font-medium',
                          CATEGORY_COLORS[sys.category] ?? 'bg-[#f1f3f5] text-[#4b5563]'
                        )}
                      >
                        {sys.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#4b5563] leading-relaxed">
                    {truncate(sys.description, 80)}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <AccessButton sys={sys} onRequest={openRequestDialog} />
                    <a
                      href={sys.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#9ca3af] hover:text-primary transition-colors"
                      title="Open"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category tabs + full grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#4b5563] uppercase tracking-wide">
              All Systems
            </h2>
            <span className="text-xs text-[#9ca3af]">{filteredSystems.length} tools</span>
          </div>

          {/* Category filter tabs */}
          <div className="flex flex-wrap gap-1 mb-6 border-b border-[#dee2e6] pb-0">
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                  categoryFilter === cat
                    ? 'border-primary text-primary'
                    : 'border-transparent text-[#4b5563] hover:text-[#111827]'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredSystems.length === 0 ? (
            <div className="py-16 text-center text-[#9ca3af]">
              <Search size={32} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium text-[#4b5563]">No tools found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSystems.map((sys) => (
                <div
                  key={sys.id}
                  className="bg-white border border-[#dee2e6] rounded-card p-5 flex flex-col gap-4 hover:shadow-ambient transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <SystemIcon sys={sys} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[#111827] text-sm">{sys.name}</p>
                        <Badge variant={sys.status === 'active' ? 'success' : 'default'}>
                          {sys.status === 'active' ? 'Active' : sys.status}
                        </Badge>
                      </div>
                      <span
                        className={cn(
                          'inline-block text-xs px-1.5 py-0.5 rounded-badge font-medium mt-0.5',
                          CATEGORY_COLORS[sys.category] ?? 'bg-[#f1f3f5] text-[#4b5563]'
                        )}
                      >
                        {sys.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#4b5563] leading-relaxed">
                    {truncate(sys.description, 80)}
                  </p>

                  {/* Owner */}
                  <div className="flex items-center gap-1 text-xs text-[#9ca3af]">
                    <span>Need help? →</span>
                    <span className="font-medium text-[#4b5563]">{sys.ownerName}</span>
                    {sys.ownerSlack && (
                      <a
                        href={`https://slack.com/app_redirect?channel=${sys.ownerSlack.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-primary hover:underline ml-1"
                      >
                        <MessageSquare size={10} />
                        {sys.ownerSlack}
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#dee2e6]">
                    <AccessButton sys={sys} onRequest={openRequestDialog} />
                    <a
                      href={sys.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#4b5563] hover:text-primary transition-colors"
                    >
                      Open
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Request access dialog */}
      <Dialog
        isOpen={!!requestTarget}
        onClose={() => setRequestTarget(null)}
        title={`Request Access: ${requestTarget?.name}`}
      >
        {requestTarget && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#f8f9fa] rounded-input">
              <SystemIcon sys={requestTarget} />
              <div>
                <p className="font-semibold text-[#111827] text-sm">{requestTarget.name}</p>
                <p className="text-xs text-[#4b5563]">{requestTarget.description}</p>
              </div>
            </div>
            <FormField
              label="Reason for Access"
              hint="Briefly describe why you need access to this tool"
            >
              <Textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="e.g. I'm joining the sales team and need this for Q3 campaign tracking"
                rows={3}
              />
            </FormField>
            <p className="text-xs text-[#9ca3af]">
              Your request will be sent to{' '}
              <span className="font-medium text-[#4b5563]">{requestTarget.ownerName}</span> for
              approval.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#dee2e6]">
              <Button variant="ghost" onClick={() => setRequestTarget(null)}>
                Cancel
              </Button>
              <Button onClick={handleRequestSubmit} loading={requestSubmitting}>
                Submit Request
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
