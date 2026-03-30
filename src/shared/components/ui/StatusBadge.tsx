import { cn } from '@/shared/utils/cn'

const variants: Record<string, string> = {
  // Generic
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-700',
  pending: 'bg-yellow-100 text-yellow-800',

  // Patient status
  prospect: 'bg-blue-100 text-blue-800',
  patient: 'bg-green-100 text-green-800',
  discharged: 'bg-gray-100 text-gray-700',
  suspended: 'bg-red-100 text-red-800',

  // Follow-up status
  contacted: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-purple-100 text-purple-800',
  resolved: 'bg-green-100 text-green-800',
  discarded: 'bg-gray-100 text-gray-600',

  // Contract / company
  valid: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  draft: 'bg-yellow-100 text-yellow-800',
}

const labels: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  prospect: 'Prospecto',
  patient: 'Paciente',
  discharged: 'Alta',
  suspended: 'Suspendido',
  contacted: 'Contactado',
  scheduled: 'Agendado',
  resolved: 'Resuelto',
  discarded: 'Descartado',
  valid: 'Vigente',
  expired: 'Vencido',
  draft: 'Borrador',
}

interface StatusBadgeProps {
  status: string
  label?: string
  className?: string
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const style = variants[status] ?? 'bg-gray-100 text-gray-700'
  const text = label ?? labels[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        style,
        className
      )}
    >
      {text}
    </span>
  )
}
