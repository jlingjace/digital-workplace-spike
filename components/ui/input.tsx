'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-input border text-sm bg-white text-[#111827] placeholder:text-[#9ca3af]',
          'focus:outline-none focus:border-primary focus:shadow-focus transition-colors',
          error ? 'border-error' : 'border-[#dee2e6]',
          'disabled:bg-[#f1f3f5] disabled:text-[#d1d5db]',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
