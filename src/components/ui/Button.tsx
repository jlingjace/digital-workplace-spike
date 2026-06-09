"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"
import { LoadingSpinner } from "./LoadingSpinner"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-sans font-medium",
    "rounded transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-[#e55a1f] active:bg-[#cc501a]",
        secondary:
          "border border-secondary text-secondary bg-transparent hover:bg-secondary/10 active:bg-secondary/20",
        ghost:
          "text-on-surface bg-transparent hover:bg-surface-container active:bg-surface-container-high",
      },
      size: {
        sm: "h-8 px-3 text-body-sm",
        md: "h-10 px-4 text-body-sm",
        lg: "h-12 px-6 text-body-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => {
    const spinnerSize = size === "lg" ? "md" : "sm"

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner
              size={spinnerSize}
              className={
                variant === "primary"
                  ? "text-on-primary"
                  : variant === "secondary"
                  ? "text-secondary"
                  : "text-on-surface"
              }
            />
            <span className="sr-only">Loading…</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = "Button"
