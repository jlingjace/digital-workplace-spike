import { cn } from '@/lib/utils'

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
  className?: string
  hint?: string
}

export function FormField({
  label,
  error,
  required,
  children,
  className,
  hint,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="text-sm font-medium text-[#4b5563]">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[#9ca3af]">{hint}</p>}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
