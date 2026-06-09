"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 rounded-full font-mono text-label-sm font-medium",
  {
    variants: {
      variant: {
        success: "bg-[#D1FAE5] text-[#065F46]",
        warning: "bg-[#FEF3C7] text-[#92400E]",
        error:   "bg-[#FEE2E2] text-[#991B1B]",
        info:    "bg-[#DBEAFE] text-[#1E40AF]",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}
