"use client"

import * as React from "react"
import { cn } from "./utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, footer, className }: DialogProps) {
  // Close on Escape key
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      aria-modal="true"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={cn(
          "bg-surface rounded-xl shadow-dialog p-6 max-w-md w-full mx-4",
          "relative flex flex-col gap-4",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <h2
            id="dialog-title"
            className="text-headline-md font-semibold text-on-surface"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors"
            aria-label="Close dialog"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M4.5 4.5l9 9M13.5 4.5l-9 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="text-body-md text-on-surface">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
