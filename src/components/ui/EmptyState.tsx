"use client"

import * as React from "react"
import { cn } from "./utils"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

function DefaultIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-outline"
    >
      <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 22h10l4 4 4-4h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center gap-4 py-12 px-6",
        className
      )}
    >
      <span className="text-outline">
        {icon ?? <DefaultIcon />}
      </span>
      <div className="flex flex-col gap-1">
        <p className="text-headline-md font-semibold text-on-surface">{title}</p>
        {description && (
          <p className="text-body-md text-on-surface-variant">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
