"use client"

import * as React from "react"
import { cn } from "./utils"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full font-sans text-body-sm text-on-surface",
            "bg-surface border border-border-subtle rounded",
            "px-3 py-2 pr-8 appearance-none",
            "transition-colors duration-150",
            "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-container-low",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {/* Chevron icon */}
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-on-surface-variant">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    )
  }
)

Select.displayName = "Select"
