"use client"

import * as React from "react"
import { cn } from "./utils"

interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  className?: string
}

export function Toggle({
  checked = false,
  onChange,
  disabled = false,
  label,
  className,
}: ToggleProps) {
  const id = React.useId()

  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        {/* Track */}
        <span
          className={cn(
            "block h-6 w-11 rounded-full transition-all duration-200",
            checked ? "bg-primary" : "bg-surface-container-high"
          )}
          aria-hidden="true"
        />
        {/* Knob */}
        <span
          className={cn(
            "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-ambient",
            "transition-all duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
          aria-hidden="true"
        />
      </span>
      {label && (
        <span className="text-body-sm text-on-surface">{label}</span>
      )}
    </label>
  )
}
