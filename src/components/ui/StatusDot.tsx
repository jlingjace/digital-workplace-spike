"use client"

import * as React from "react"
import { cn } from "./utils"

interface StatusDotProps {
  status: "online" | "offline" | "pending"
  label?: string
  className?: string
}

const dotClasses: Record<StatusDotProps["status"], string> = {
  online:  "bg-success-green",
  offline: "bg-outline",
  pending: "bg-warning-amber animate-pulse",
}

export function StatusDot({ status, label, className }: StatusDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn("inline-block h-2 w-2 rounded-full flex-shrink-0", dotClasses[status])}
        aria-hidden="true"
      />
      {label && (
        <span className="text-body-sm text-on-surface-variant">{label}</span>
      )}
    </span>
  )
}
