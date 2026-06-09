"use client"

import * as React from "react"
import { cn } from "./utils"

type AlertVariant = "success" | "warning" | "error"

const variantClasses: Record<AlertVariant, string> = {
  success: "bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]",
  warning: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]",
  error:   "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]",
}

const variantIcons: Record<AlertVariant, React.ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 9l2.5 2.5L12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 2L16.5 15H1.5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 7.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.75" fill="currentColor" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 6.5l5 5M11.5 6.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

interface AlertProps {
  variant: AlertVariant
  title?: string
  message: string
  onClose?: () => void
  className?: string
}

export function Alert({ variant, title, message, onClose, className }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 border-l-4 rounded p-4",
        variantClasses[variant],
        className
      )}
    >
      <span className="flex-shrink-0 mt-0.5">{variantIcons[variant]}</span>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-body-sm font-semibold mb-0.5">{title}</p>
        )}
        <p className="text-body-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Close alert"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
