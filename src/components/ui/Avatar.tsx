"use client"

import * as React from "react"
import { cn } from "./utils"

const sizeClasses = {
  sm: "h-8 w-8 text-label-sm",
  md: "h-10 w-10 text-label-md",
  lg: "h-12 w-12 text-label-md",
}

interface AvatarProps {
  src?: string
  name: string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false)
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full flex-shrink-0 overflow-hidden",
        sizeClasses[size],
        !src || imgError
          ? "bg-primary-container text-on-primary-container font-medium"
          : "",
        className
      )}
      aria-label={name}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        initial
      )}
    </span>
  )
}
