'use client'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-input border text-sm bg-white text-[#111827]',
          'focus:outline-none focus:border-primary focus:shadow-focus transition-colors',
          error ? 'border-error' : 'border-[#dee2e6]',
          'disabled:bg-[#f1f3f5] disabled:text-[#d1d5db]',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = 'Select'
