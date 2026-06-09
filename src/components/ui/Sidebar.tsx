"use client"

import * as React from "react"
import { cn } from "./utils"

interface SidebarItem {
  label: string
  href: string
  icon?: React.ReactNode
  active?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  header?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Sidebar({ items, header, footer, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 h-full w-64",
        "bg-surface-gray border-r border-border-subtle",
        "flex flex-col",
        className
      )}
    >
      {header && (
        <div className="flex-shrink-0 p-4 border-b border-border-subtle">
          {header}
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Sidebar navigation">
        <ul className="flex flex-col gap-0.5" role="list">
          {items.map((item, index) => (
            <li key={index}>
              <a
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 py-2 px-3 rounded-md text-body-sm transition-colors duration-150",
                  item.active
                    ? "bg-primary-container text-on-primary-container font-medium"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
                aria-current={item.active ? "page" : undefined}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {footer && (
        <div className="flex-shrink-0 p-4 border-t border-border-subtle">
          {footer}
        </div>
      )}
    </aside>
  )
}
