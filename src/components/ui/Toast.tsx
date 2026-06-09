"use client"

import * as React from "react"
import { cn } from "./utils"

type ToastVariant = "success" | "warning" | "error"

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-[#D1FAE5] text-[#065F46] border-[#6EE7B7]",
  warning: "bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]",
  error:   "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]",
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 8l2.5 2.5L11.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1.5L14.5 13.5H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
}

interface ToastProps {
  variant: ToastVariant
  message: string
  duration?: number
  onClose?: () => void
  className?: string
}

export function Toast({
  variant,
  message,
  duration = 4000,
  onClose,
  className,
}: ToastProps) {
  const [exiting, setExiting] = React.useState(false)

  const handleClose = React.useCallback(() => {
    setExiting(true)
    setTimeout(() => onClose?.(), 200)
  }, [onClose])

  React.useEffect(() => {
    if (duration <= 0) return
    const timer = setTimeout(handleClose, duration)
    return () => clearTimeout(timer)
  }, [duration, handleClose])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center gap-3 min-w-[280px] max-w-sm",
        "border rounded shadow-dialog px-4 py-3",
        variantClasses[variant],
        exiting ? "animate-slide-out-right" : "animate-slide-in-right",
        className
      )}
    >
      <span className="flex-shrink-0">{variantIcons[variant]}</span>
      <p className="flex-1 text-body-sm">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
