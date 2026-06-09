"use client"

import * as React from "react"
import { cn } from "./utils"

interface FormFieldProps {
  label?: string
  htmlFor?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  error,
  required = false,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-body-sm font-medium text-on-surface"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-primary" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-body-sm text-error" role="alert">
          {/* Warning icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="flex-shrink-0"
          >
            <path
              d="M7 1.167L12.833 11H1.167L7 1.167z"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <path
              d="M7 5.833v2.334"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <circle cx="7" cy="9.333" r="0.583" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
