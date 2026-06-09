"use client"

import * as React from "react"
import { cn } from "./utils"

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  id?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  checked = false,
  onChange,
  label,
  id,
  disabled = false,
  className,
}: CheckboxProps) {
  const checkboxId = id ?? React.useId()

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className="relative flex-shrink-0">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          className="sr-only"
        />
        {/* Visual checkbox */}
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-sm border transition-colors duration-150",
            "focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-1",
            checked
              ? "bg-primary border-primary"
              : "bg-surface border-border-subtle hover:border-primary/60"
          )}
          aria-hidden="true"
        >
          {checked && (
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="#ffffff"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
      {label && (
        <span className="text-body-sm text-on-surface">{label}</span>
      )}
    </label>
  )
}
