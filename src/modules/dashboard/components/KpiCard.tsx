import { cn } from '@/shared/utils/cn'

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export function KpiCard({ title, value, description, icon, className }: KpiCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-5 shadow-sm', className)}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
