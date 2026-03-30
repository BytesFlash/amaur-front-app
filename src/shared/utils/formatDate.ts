import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(dateString: string | null | undefined, pattern = 'dd/MM/yyyy'): string {
  if (!dateString) return '—'
  const date = parseISO(dateString)
  if (!isValid(date)) return '—'
  return format(date, pattern, { locale: es })
}

export function formatDateTime(dateString: string | null | undefined): string {
  return formatDate(dateString, 'dd/MM/yyyy HH:mm')
}

export function formatShortDate(dateString: string | null | undefined): string {
  return formatDate(dateString, "d 'de' MMMM yyyy")
}
