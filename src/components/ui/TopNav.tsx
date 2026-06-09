"use client"

import * as React from "react"
import { cn } from "./utils"
import { Avatar } from "./Avatar"

interface TopNavProps {
  title?: string
  logo?: React.ReactNode
  actions?: React.ReactNode
  user?: {
    name: string
    avatar?: string
  }
  className?: string
}

export function TopNav({ title, logo, actions, user, className }: TopNavProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40",
        "h-14 bg-surface border-b border-border-subtle",
        "flex items-center px-4 gap-4",
        className
      )}
    >
      {/* Left: logo / title */}
      <div className="flex items-center gap-2 flex-shrink-0 mr-auto">
        {logo && <span>{logo}</span>}
        {title && (
          <span className="text-label-md font-semibold text-on-surface truncate">
            {title}
          </span>
        )}
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {user && (
          <div className="flex items-center gap-2">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <span className="hidden sm:block text-body-sm text-on-surface-variant truncate max-w-[140px]">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
