'use client'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ isOpen, onClose, title, children, className }: DialogProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white rounded-card shadow-elevated w-full max-w-lg mx-4',
          className
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dee2e6]">
          <h2 className="text-lg font-semibold text-[#111827]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#111827] transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
