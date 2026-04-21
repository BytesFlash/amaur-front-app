export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  requested: 'Solicitada',
  confirmed: 'Confirmada',
  in_progress: 'Atendiendo',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'Inasistencia',
}

export const APPOINTMENT_STATUS_VARIANTS: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  requested: 'secondary',
  confirmed: 'outline',
  in_progress: 'default',
  completed: 'default',
  cancelled: 'destructive',
  no_show: 'secondary',
}

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'requested', label: 'Solicitada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'in_progress', label: 'Atendiendo' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'no_show', label: 'Inasistencia' },
] as const
