'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Megaphone,
  Grid3X3,
  Users,
  Settings,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  {
    label: 'Content',
    href: '/admin/content',
    icon: Megaphone,
    children: [
      { label: 'Announcements', href: '/admin/content/announcements' },
      { label: 'Systems Directory', href: '/admin/content/systems' },
    ],
  },
  { label: 'Users & Permissions', href: '/admin/users', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>(['/admin/content'])

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    )
  }

  return (
    <aside className="w-60 min-h-screen bg-[#f8f9fa] border-r border-[#dee2e6] flex flex-col shrink-0">
      <div className="px-4 py-5 border-b border-[#dee2e6]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-btn flex items-center justify-center">
            <Grid3X3 size={16} className="text-white" />
          </div>
          <span className="font-semibold text-[#111827] text-sm">Digital Workplace</span>
        </div>
        <div className="mt-2">
          <span className="text-xs font-medium bg-warning-container text-warning-on-container px-2 py-0.5 rounded">
            Admin Mode
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            const isExpanded = expandedItems.includes(item.href)
            const Icon = item.icon

            return (
              <li key={item.href}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm transition-colors',
                        isActive
                          ? 'bg-primary-container text-primary-on-container font-medium'
                          : 'text-[#4b5563] hover:bg-[#e9ecef]'
                      )}
                    >
                      <Icon size={16} />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        size={14}
                        className={cn('transition-transform', isExpanded && 'rotate-180')}
                      />
                    </button>
                    {isExpanded && (
                      <ul className="ml-6 mt-0.5 space-y-0.5">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={cn(
                                'block px-3 py-1.5 rounded-btn text-sm transition-colors',
                                pathname === child.href
                                  ? 'bg-primary-50 text-primary-700 font-medium'
                                  : 'text-[#4b5563] hover:text-[#111827] hover:bg-[#e9ecef]'
                              )}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-btn text-sm transition-colors',
                      isActive
                        ? 'bg-primary-container text-primary-on-container font-medium'
                        : 'text-[#4b5563] hover:bg-[#e9ecef]'
                    )}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-[#dee2e6]">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#4b5563] hover:text-[#111827] transition-colors"
        >
          ← Back to Portal
        </Link>
      </div>
    </aside>
  )
}
