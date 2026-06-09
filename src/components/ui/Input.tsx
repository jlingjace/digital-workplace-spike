"use client"

import * as React from "react"
import { cn } from "./utils"

const inputBaseClasses = [
  "w-full font-sans text-body-sm text-on-surface",
  "bg-surface border border-border-subtle rounded",
  "px-3 py-2 placeholder:text-on-surface-variant/60",
  "transition-colors duration-150",
  "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-container-low",
].join(" ")

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(inputBaseClasses, className)}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(inputBaseClasses, "resize-y min-h-[80px]", className)}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"
