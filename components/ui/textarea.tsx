'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3 py-2 rounded-input border text-sm bg-white text-[#111827] placeholder:text-[#9ca3af]',
          'focus:outline-none focus:border-primary focus:shadow-focus transition-colors resize-none',
          error ? 'border-error' : 'border-[#dee2e6]',
          'disabled:bg-[#f1f3f5] disabled:text-[#d1d5db]',
          className
        )}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'
