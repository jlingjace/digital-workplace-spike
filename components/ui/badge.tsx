import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#f1f3f5] text-[#4b5563]',
  success: 'bg-success-container text-success-on-container',
  warning: 'bg-warning-container text-warning-on-container',
  error: 'bg-error-container text-error-on-container',
  info: 'bg-info-container text-info-on-container',
  secondary: 'bg-secondary-container text-secondary-on-container',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-badge text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
