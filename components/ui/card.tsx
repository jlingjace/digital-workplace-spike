import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-card border border-[#dee2e6]',
        hover && 'hover:shadow-ambient transition-shadow cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-6 py-4 border-b border-[#dee2e6]', className)}>{children}</div>
  )
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('px-6 py-4', className)}>{children}</div>
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-[#dee2e6] bg-[#f8f9fa] rounded-b-card',
        className
      )}
    >
      {children}
    </div>
  )
}
