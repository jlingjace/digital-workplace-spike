'use client'

import { useState, useMemo } from 'react'
import { Search, CheckCircle, ChevronDown } from 'lucide-react'
import { mockUsers } from '@/lib/mock-data'
import { User, UserRole } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Employee',
  dept_admin: 'Dept Admin',
  platform_admin: 'Platform Admin',
}

const ROLE_BADGE_VARIANT: Record<UserRole, 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary'> = {
  employee: 'default',
  dept_admin: 'info',
  platform_admin: 'secondary',
}

interface Toast {
  id: number
  message: string
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkRole, setBulkRole] = useState<UserRole>('employee')
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
    )
  }, [users, searchQuery])

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id))
  const someFilteredSelected = filteredUsers.some((u) => selectedIds.has(u.id))

  function addToast(message: string) {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredUsers.forEach((u) => next.delete(u.id))
        return next
      })
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        filteredUsers.forEach((u) => next.add(u.id))
        return next
      })
    }
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function applyBulkRole() {
    const count = selectedIds.size
    setUsers((prev) =>
      prev.map((u) => (selectedIds.has(u.id) ? { ...u, role: bulkRole } : u))
    )
    setSelectedIds(new Set())
    addToast(`Role updated to "${ROLE_LABELS[bulkRole]}" for ${count} user(s)`)
  }

  function cancelBulkSelection() {
    setSelectedIds(new Set())
  }

  function changeRole(userId: string, newRole: UserRole) {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
    setInlineEditId(null)
    addToast(`${user.name}'s role updated to "${ROLE_LABELS[newRole]}"`)
  }

  const selectedCount = selectedIds.size

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-2 bg-success-container text-success-on-container px-4 py-3 rounded-card shadow-elevated text-sm font-medium pointer-events-auto"
          >
            <CheckCircle size={15} />
            {toast.message}
          </div>
        ))}
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Users & Permissions</h1>
          <p className="text-sm text-[#4b5563] mt-1">
            Manage user roles and permissions across the platform
          </p>
        </div>
        <span className="text-sm text-[#9ca3af]">{users.length} users total</span>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, email, or department..."
          className="pl-9"
        />
      </div>

      {/* Bulk action toolbar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-container rounded-card border border-primary-200">
          <span className="text-sm font-medium text-primary-on-container">
            {selectedCount} selected
          </span>
          <span className="text-primary-on-container opacity-40">|</span>
          <span className="text-sm text-primary-on-container">Change Role to:</span>
          <Select
            value={bulkRole}
            onChange={(e) => setBulkRole(e.target.value as UserRole)}
            className="w-40 h-8 text-xs"
          >
            <option value="employee">Employee</option>
            <option value="dept_admin">Dept Admin</option>
            <option value="platform_admin">Platform Admin</option>
          </Select>
          <Button size="sm" onClick={applyBulkRole}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelBulkSelection}>
            Cancel
          </Button>
        </div>
      )}

      {/* Data table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee2e6] bg-[#f8f9fa]">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someFilteredSelected && !allFilteredSelected
                    }}
                    onChange={toggleSelectAll}
                    className="accent-primary w-4 h-4"
                    aria-label="Select all"
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Name</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Email</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Department</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Role</th>
                <th className="text-left px-4 py-3 font-medium text-[#4b5563]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#9ca3af]">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.has(user.id)
                  const isInlineEditing = inlineEditId === user.id
                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        'border-b border-[#dee2e6] transition-colors',
                        isSelected ? 'bg-primary-50' : 'hover:bg-[#f8f9fa]'
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(user.id)}
                          className="accent-primary w-4 h-4"
                          aria-label={`Select ${user.name}`}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={user.name}
                            imageUrl={user.avatarUrl}
                            size="sm"
                          />
                          <span className="font-medium text-[#111827]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4b5563]">{user.email}</td>
                      <td className="px-4 py-3 text-[#4b5563]">{user.department}</td>
                      <td className="px-4 py-3">
                        {isInlineEditing ? (
                          <div className="flex items-center gap-2">
                            <Select
                              defaultValue={user.role}
                              onChange={(e) => changeRole(user.id, e.target.value as UserRole)}
                              className="w-36 h-7 text-xs py-0"
                              autoFocus
                              onBlur={() => setInlineEditId(null)}
                            >
                              <option value="employee">Employee</option>
                              <option value="dept_admin">Dept Admin</option>
                              <option value="platform_admin">Platform Admin</option>
                            </Select>
                          </div>
                        ) : (
                          <button
                            onClick={() => setInlineEditId(user.id)}
                            className="group inline-flex items-center gap-1 focus:outline-none"
                            title="Click to change role"
                            aria-label={`Change role for ${user.name}, currently ${ROLE_LABELS[user.role]}`}
                          >
                            <Badge variant={ROLE_BADGE_VARIANT[user.role]}>
                              {ROLE_LABELS[user.role]}
                            </Badge>
                            <ChevronDown
                              size={12}
                              className="text-[#9ca3af] opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#9ca3af] text-xs font-mono">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[#9ca3af]">
        <span className="font-medium text-[#4b5563]">Role levels:</span>
        {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
          <span key={role} className="flex items-center gap-1.5">
            <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>
            {role === 'employee' && '— read-only portal access'}
            {role === 'dept_admin' && '— can manage own dept announcements'}
            {role === 'platform_admin' && '— full admin access'}
          </span>
        ))}
      </div>
    </div>
  )
}
