import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Stethoscope } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { usePermission } from '@/shared/hooks/usePermission'
import { useAppointment, useAppointmentsByPatient, useUpdateAppointment } from '@/modules/appointments/hooks/useAppointments'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_STATUS_VARIANTS } from '@/modules/appointments/lib/status'
import { useClinicalRecord, usePatient } from '@/modules/patients/hooks/usePatients'
import { toast } from 'sonner'
import { useWorkers, useWorkerCalendar } from '../hooks/useWorkers'
import { cn } from '@/shared/utils/cn'
import type { DayCalendarDTO } from '../api/workersApi'

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const names = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return `${names[m - 1]} ${y}`
}

function minutesToHours(min: number): string {
  if (min <= 0) return '0 h'
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

function toDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`)
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const hh = Math.floor(total / 60) % 24
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

function formatSlotDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function isPastSlot(date: string, time: string, duration: number): boolean {
  const start = toDateTime(date, time)
  const end = new Date(start.getTime() + duration * 60_000)
  return end.getTime() <= Date.now()
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
type SlotSummary = DayCalendarDTO['appointments'][number]
type CalendarModalTab = 'appointment' | 'history' | 'clinical'

function DayCell({
  day,
  today,
  selected,
  onSelect,
}: {
  day: DayCalendarDTO
  today: string
  selected: boolean
  onSelect: () => void
}) {
  const isToday = day.date === today
  const dayNum = parseInt(day.date.split('-')[2])

  let bg = 'bg-background hover:bg-muted/50'
  let border = 'border-border'
  let labelColor = 'text-muted-foreground'

  if (day.total_minutes > 0) {
    const ratio = day.available_minutes / day.total_minutes
    if (ratio >= 0.5) {
      bg = 'bg-green-50 hover:bg-green-100'
      border = 'border-green-200'
      labelColor = 'text-green-700'
    } else if (ratio > 0) {
      bg = 'bg-amber-50 hover:bg-amber-100'
      border = 'border-amber-200'
      labelColor = 'text-amber-700'
    } else {
      bg = 'bg-red-50 hover:bg-red-100'
      border = 'border-red-200'
      labelColor = 'text-red-700'
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'min-h-[88px] w-full rounded-md border p-2 text-left transition-colors',
        bg,
        border,
        selected ? 'ring-2 ring-primary ring-offset-1' : '',
        isToday ? 'ring-2 ring-primary ring-offset-1' : '',
      )}
    >
      <span className={cn('block text-xs font-semibold', isToday ? 'text-primary' : 'text-foreground')}>
        {dayNum}
      </span>

      {day.total_minutes > 0 && (
        <>
          <div className="mt-1.5 h-1 rounded-full bg-white/60">
            <div
              className={cn(
                'h-1 rounded-full',
                labelColor === 'text-green-700'
                  ? 'bg-green-500'
                  : labelColor === 'text-amber-700'
                  ? 'bg-amber-500'
                  : 'bg-red-500',
              )}
              style={{ width: `${Math.min(100, (day.booked_minutes / day.total_minutes) * 100)}%` }}
            />
          </div>
          <p className={cn('mt-1 text-[10px] leading-tight', labelColor)}>
            {minutesToHours(day.available_minutes)} libre
          </p>
          {(day.appointments ?? []).length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {(day.appointments ?? []).length} cita{(day.appointments ?? []).length !== 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </button>
  )
}

export function WorkerCalendarPage() {
  const { hasPermission } = usePermission()
  const canEditAppointments = hasPermission('appointments:edit')
  const canViewPatient = hasPermission('patients:view')

  const [workerId, setWorkerId] = useState('')
  const [month, setMonth] = useState(currentMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; item: SlotSummary } | null>(null)
  const [detailTab, setDetailTab] = useState<CalendarModalTab>('appointment')
  const [selectedHistoryAppointmentId, setSelectedHistoryAppointmentId] = useState('')
  const [statusDraft, setStatusDraft] = useState('')
  const [clinicalDraft, setClinicalDraft] = useState({
    chief_complaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    notes: '',
    follow_up_required: false,
    follow_up_date: '',
    follow_up_notes: '',
  })
  const [autoCompletedIds, setAutoCompletedIds] = useState<Record<string, boolean>>({})

  const { data: workersData } = useWorkers({ active: true, limit: 200 })
  const workers = workersData?.data ?? []
  const { data: calendarDays = [], isLoading } = useWorkerCalendar(workerId, month)

  const selectedDay = calendarDays.find((d) => d.date === selectedDate) ?? null
  const selectedWorker = workers.find((w) => w.id === workerId)

  const selectedAppointmentId = selectedSlot?.item.appointment_id ?? ''
  const selectedPatientId = selectedSlot?.item.patient_id ?? ''
  const { data: selectedAppointment, isLoading: loadingAppointment } = useAppointment(selectedAppointmentId)
  const { data: selectedHistoryAppointment, isLoading: loadingHistoryAppointmentDetail } = useAppointment(selectedHistoryAppointmentId)
  const { data: selectedPatient } = usePatient(canViewPatient ? selectedPatientId : '')
  const { data: patientAppointmentsData, isLoading: loadingPatientAppointments } = useAppointmentsByPatient(
    canViewPatient ? selectedPatientId : '',
    50,
  )
  const { data: patientClinicalRecord, isLoading: loadingPatientClinicalRecord } = useClinicalRecord(
    canViewPatient ? selectedPatientId : '',
  )
  const updateMutation = useUpdateAppointment(selectedAppointmentId)

  const today = new Date().toISOString().slice(0, 10)
  const firstDayOfWeek =
    calendarDays.length > 0
      ? new Date(calendarDays[0].date + 'T00:00:00').getDay()
      : 0

  const cells: (DayCalendarDTO | null)[] = [...Array(firstDayOfWeek).fill(null), ...calendarDays]
  while (cells.length % 7 !== 0) cells.push(null)

  const totalAvail = calendarDays.reduce((s, d) => s + d.available_minutes, 0)
  const totalBooked = calendarDays.reduce((s, d) => s + d.booked_minutes, 0)
  const totalCapacity = calendarDays.reduce((s, d) => s + d.total_minutes, 0)

  const slotEndsAt = useMemo(() => {
    if (!selectedSlot) return ''
    return addMinutes(selectedSlot.item.scheduled_at, selectedSlot.item.duration_minutes)
  }, [selectedSlot])
  const slotServiceName = selectedSlot?.item.service_type_name || 'Servicio'
  const slotPatientName = selectedSlot?.item.patient_name || selectedSlot?.item.label || 'Paciente'
  const patientAppointments = (patientAppointmentsData?.data ?? []).slice().sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at))

  useEffect(() => {
    if (!selectedSlot) {
      setStatusDraft('')
      setSelectedHistoryAppointmentId('')
      return
    }
    setDetailTab('appointment')
    setSelectedHistoryAppointmentId('')
    setStatusDraft(selectedAppointment?.status ?? selectedSlot.item.status ?? '')
  }, [selectedSlot, selectedAppointment?.status])

  useEffect(() => {
    if (!selectedAppointmentId) {
      setClinicalDraft({
        chief_complaint: '',
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        notes: '',
        follow_up_required: false,
        follow_up_date: '',
        follow_up_notes: '',
      })
      return
    }
    if (!selectedAppointment) return
    setClinicalDraft({
      chief_complaint: selectedAppointment.chief_complaint ?? '',
      subjective: selectedAppointment.subjective ?? '',
      objective: selectedAppointment.objective ?? '',
      assessment: selectedAppointment.assessment ?? '',
      plan: selectedAppointment.plan ?? '',
      notes: selectedAppointment.notes ?? '',
      follow_up_required: Boolean(selectedAppointment.follow_up_required),
      follow_up_date: selectedAppointment.follow_up_date ? selectedAppointment.follow_up_date.slice(0, 10) : '',
      follow_up_notes: selectedAppointment.follow_up_notes ?? '',
    })
  }, [selectedAppointmentId, selectedAppointment])

  useEffect(() => {
    if (!selectedSlot) return
    if (selectedSlot.item.type !== 'individual') return
    if (selectedSlot.item.status !== 'in_progress') return
    if (!selectedAppointmentId || !canEditAppointments) return
    if (autoCompletedIds[selectedAppointmentId]) return
    if (!isPastSlot(selectedSlot.date, selectedSlot.item.scheduled_at, selectedSlot.item.duration_minutes)) return

    setAutoCompletedIds((prev) => ({ ...prev, [selectedAppointmentId]: true }))
    updateMutation
      .mutateAsync({ status: 'completed' })
      .then(() => {
        setStatusDraft('completed')
        setSelectedSlot((prev) =>
          prev ? { ...prev, item: { ...prev.item, status: 'completed' } } : prev,
        )
        toast.success('La cita se marcó automáticamente como completada')
      })
      .catch(() => {
        toast.error('No se pudo completar automáticamente la cita')
      })
  }, [selectedSlot, selectedAppointmentId, canEditAppointments, autoCompletedIds, updateMutation])

  async function saveStatus(nextStatus: string) {
    if (!selectedSlot || selectedSlot.item.type !== 'individual' || !selectedAppointmentId) return
    try {
      await updateMutation.mutateAsync({ status: nextStatus })
      setStatusDraft(nextStatus)
      setSelectedSlot((prev) =>
        prev ? { ...prev, item: { ...prev.item, status: nextStatus } } : prev,
      )
      toast.success('Estado actualizado')
    } catch {
      toast.error('No se pudo actualizar el estado')
    }
  }

  async function saveClinicalNotes() {
    if (!selectedSlot || selectedSlot.item.type !== 'individual' || !selectedAppointmentId) return
    try {
      await updateMutation.mutateAsync({
        chief_complaint: clinicalDraft.chief_complaint || undefined,
        subjective: clinicalDraft.subjective || undefined,
        objective: clinicalDraft.objective || undefined,
        assessment: clinicalDraft.assessment || undefined,
        plan: clinicalDraft.plan || undefined,
        notes: clinicalDraft.notes || undefined,
        follow_up_required: clinicalDraft.follow_up_required,
        follow_up_date: clinicalDraft.follow_up_date || undefined,
        follow_up_notes: clinicalDraft.follow_up_notes || undefined,
      })
      toast.success('Consulta y notas guardadas en la cita')
    } catch {
      toast.error('No se pudieron guardar los datos clínicos')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario de profesionales"
        description="Vista mensual de disponibilidad, citas y flujo clínico por bloque horario"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={workerId || 'none'}
          onValueChange={(v) => {
            setWorkerId(v === 'none' ? '' : v)
            setSelectedDate(null)
            setSelectedSlot(null)
          }}
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Seleccionar profesional..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">- Seleccionar profesional -</SelectItem>
            {workers.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.first_name} {w.last_name}
                {w.role_title ? ` (${w.role_title})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => { setMonth(prevMonth(month)); setSelectedDate(null); setSelectedSlot(null) }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-44 text-center text-sm font-medium">{monthLabel(month)}</span>
          <Button variant="outline" size="icon" onClick={() => { setMonth(nextMonth(month)); setSelectedDate(null); setSelectedSlot(null) }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {[
            { color: 'bg-green-400', label: '>=50% libre' },
            { color: 'bg-amber-400', label: '25-50% libre' },
            { color: 'bg-red-400', label: '<25% libre' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={cn('h-2.5 w-2.5 rounded-sm', l.color)} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {!workerId ? (
        <div className="rounded-lg border border-dashed p-20 text-center text-sm text-muted-foreground">
          Selecciona un profesional para ver su calendario de disponibilidad
        </div>
      ) : isLoading ? (
        <div className="rounded-lg border p-20 text-center text-sm text-muted-foreground">
          Cargando calendario...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {totalCapacity > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Capacidad mensual</p>
                  <p className="text-lg font-semibold">{minutesToHours(totalCapacity)}</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                  <p className="text-xs text-green-700">Disponible</p>
                  <p className="text-lg font-semibold text-green-800">{minutesToHours(totalAvail)}</p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                  <p className="text-xs text-red-700">Ocupado</p>
                  <p className="text-lg font-semibold text-red-800">{minutesToHours(totalBooked)}</p>
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 grid grid-cols-7 gap-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, i) =>
                  cell === null ? (
                    <div key={`pad-${i}`} className="min-h-[88px]" />
                  ) : (
                    <DayCell
                      key={cell.date}
                      day={cell}
                      today={today}
                      selected={cell.date === selectedDate}
                      onSelect={() => {
                        setSelectedDate((prev) => (prev === cell.date ? null : cell.date))
                        setSelectedSlot(null)
                      }}
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="self-start rounded-lg border bg-card p-4">
            {!selectedDay ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>Haz clic en un día</p>
                <p>para ver sus bloques</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold capitalize">
                    {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('es-CL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  {selectedWorker && (
                    <p className="text-xs text-muted-foreground">
                      {selectedWorker.first_name} {selectedWorker.last_name}
                    </p>
                  )}
                </div>

                {(selectedDay.appointments ?? []).length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Bloques ({(selectedDay.appointments ?? []).length})
                    </p>
                    {(selectedDay.appointments ?? [])
                      .slice()
                      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
                      .map((appt, i) => (
                        <button
                          key={`${appt.appointment_id ?? appt.scheduled_at}-${i}`}
                          type="button"
                          onClick={() => setSelectedSlot({ date: selectedDay.date, item: appt })}
                          className="w-full rounded-md border bg-muted/30 px-2 py-2 text-left text-xs transition-colors hover:bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="font-medium">
                              {appt.scheduled_at} - {addMinutes(appt.scheduled_at, appt.duration_minutes)}
                            </span>
                            <Badge
                              variant={appt.type === 'group' ? 'secondary' : APPOINTMENT_STATUS_VARIANTS[appt.status ?? 'confirmed'] ?? 'outline'}
                              className="ml-auto text-[10px]"
                            >
                              {appt.type === 'group'
                                ? 'Grupal'
                                : APPOINTMENT_STATUS_LABELS[appt.status ?? 'confirmed'] ?? 'Individual'}
                            </Badge>
                          </div>
                          <p className="truncate pl-5 text-muted-foreground">{appt.label || 'Sin etiqueta'}</p>
                        </button>
                      ))}
                    <p className="text-[11px] text-muted-foreground">
                      Haz clic en una hora para ver detalle clínico y acciones.
                    </p>
                  </div>
                ) : (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    Sin citas para este día
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent className="w-[min(98vw,1280px)] max-w-none max-h-[94vh] overflow-hidden p-0">
          {!selectedSlot ? null : (
            <>
              <DialogHeader className="border-b px-6 pb-4 pt-6">
                <DialogTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Tipo de consulta: {slotServiceName} / {slotPatientName}
                </DialogTitle>
                <DialogDescription>
                  {formatSlotDate(selectedSlot.date)} - {selectedSlot.item.scheduled_at} a {slotEndsAt}
                </DialogDescription>
              </DialogHeader>

              <Tabs
                value={detailTab}
                onValueChange={(value) => setDetailTab(value as CalendarModalTab)}
                className="flex h-[calc(94vh-112px)] flex-col"
              >
                <div className="border-b px-6 py-3">
                  <TabsList className="grid h-auto w-full grid-cols-3 rounded-xl bg-muted/60 p-1">
                    <TabsTrigger value="appointment" className="rounded-lg py-2 text-xs sm:text-sm">
                      Cita del paciente
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg py-2 text-xs sm:text-sm">
                      Historial del paciente
                    </TabsTrigger>
                    <TabsTrigger value="clinical" className="rounded-lg py-2 text-xs sm:text-sm">
                      Historial clinico
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
                  <TabsContent value="appointment" className="mt-0">
                    <div className="grid items-start gap-4 lg:grid-cols-[1.2fr_1fr]">
                      <div className="space-y-4 rounded-lg border p-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Paciente</p>
                    <p className="text-sm font-semibold">
                      {selectedSlot.item.patient_name || selectedSlot.item.label || 'Sin nombre'}
                    </p>
                    {selectedPatient ? (
                      <p className="text-xs text-muted-foreground">
                        {selectedPatient.rut ? `RUT ${selectedPatient.rut} · ` : ''}
                        {selectedPatient.phone ?? 'Sin teléfono'} · {selectedPatient.email ?? 'Sin correo'}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      Servicio: {selectedSlot.item.service_type_name || 'Sin detalle'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-muted-foreground">Inicio</p>
                      <p className="font-medium">{selectedSlot.item.scheduled_at}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-muted-foreground">Duración</p>
                      <p className="font-medium">{selectedSlot.item.duration_minutes} min</p>
                    </div>
                  </div>

                  {selectedSlot.item.type === 'individual' && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado clínico</p>
                      <div className="flex items-center gap-2">
                        <Select
                          value={statusDraft || selectedSlot.item.status || 'requested'}
                          onValueChange={setStatusDraft}
                          disabled={!canEditAppointments}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => saveStatus(statusDraft)}
                          disabled={!canEditAppointments || !statusDraft || statusDraft === selectedSlot.item.status || updateMutation.isPending}
                        >
                          Guardar
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEditAppointments || updateMutation.isPending}
                          onClick={() => saveStatus('in_progress')}
                        >
                          Atendiendo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEditAppointments || updateMutation.isPending}
                          onClick={() => saveStatus('completed')}
                        >
                          Completar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canEditAppointments || updateMutation.isPending}
                          onClick={() => saveStatus('cancelled')}
                        >
                          Liberar bloque
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Registro clínico de la cita</p>
                  {selectedSlot.item.type === 'individual' ? (
                    loadingAppointment ? (
                      <p className="text-xs text-muted-foreground">Cargando datos clínicos...</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Motivo de consulta</Label>
                          <Textarea
                            rows={2}
                            value={clinicalDraft.chief_complaint}
                            onChange={(e) => setClinicalDraft((prev) => ({ ...prev, chief_complaint: e.target.value }))}
                            disabled={!canEditAppointments}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Subjetivo</Label>
                          <Textarea
                            rows={2}
                            value={clinicalDraft.subjective}
                            onChange={(e) => setClinicalDraft((prev) => ({ ...prev, subjective: e.target.value }))}
                            disabled={!canEditAppointments}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Objetivo</Label>
                          <Textarea
                            rows={2}
                            value={clinicalDraft.objective}
                            onChange={(e) => setClinicalDraft((prev) => ({ ...prev, objective: e.target.value }))}
                            disabled={!canEditAppointments}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Evaluación</Label>
                          <Textarea
                            rows={2}
                            value={clinicalDraft.assessment}
                            onChange={(e) => setClinicalDraft((prev) => ({ ...prev, assessment: e.target.value }))}
                            disabled={!canEditAppointments}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Plan</Label>
                          <Textarea
                            rows={2}
                            value={clinicalDraft.plan}
                            onChange={(e) => setClinicalDraft((prev) => ({ ...prev, plan: e.target.value }))}
                            disabled={!canEditAppointments}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Notas de consulta</Label>
                          <Textarea
                            rows={2}
                            value={clinicalDraft.notes}
                            onChange={(e) => setClinicalDraft((prev) => ({ ...prev, notes: e.target.value }))}
                            disabled={!canEditAppointments}
                          />
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <input
                            id="follow-up-required"
                            type="checkbox"
                            checked={clinicalDraft.follow_up_required}
                            onChange={(e) => setClinicalDraft((prev) => ({ ...prev, follow_up_required: e.target.checked }))}
                            disabled={!canEditAppointments}
                          />
                          <Label htmlFor="follow-up-required" className="text-xs">Requiere seguimiento</Label>
                        </div>
                        {clinicalDraft.follow_up_required ? (
                          <div className="space-y-2 rounded-md border border-dashed p-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Fecha de seguimiento</Label>
                              <Input
                                type="date"
                                value={clinicalDraft.follow_up_date}
                                onChange={(e) => setClinicalDraft((prev) => ({ ...prev, follow_up_date: e.target.value }))}
                                disabled={!canEditAppointments}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Notas de seguimiento</Label>
                              <Textarea
                                rows={2}
                                value={clinicalDraft.follow_up_notes}
                                onChange={(e) => setClinicalDraft((prev) => ({ ...prev, follow_up_notes: e.target.value }))}
                                disabled={!canEditAppointments}
                              />
                            </div>
                          </div>
                        ) : null}

                        <Button
                          className="w-full"
                          onClick={saveClinicalNotes}
                          disabled={!canEditAppointments || updateMutation.isPending}
                        >
                          Guardar registro clínico
                        </Button>
                      </div>
                    )
                  ) : null}

                  {selectedSlot.item.type === 'group' && (
                    <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                      Este bloque pertenece a una sesión grupal. El registro clínico detallado aplica a citas individuales.
                    </p>
                  )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0">
                    <div className="space-y-4">
                      {!canViewPatient ? (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          No tienes permisos para ver historial del paciente.
                        </p>
                      ) : loadingPatientAppointments ? (
                        <p className="text-sm text-muted-foreground">Cargando historial del paciente...</p>
                      ) : patientAppointments.length === 0 ? (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          No hay citas registradas para este paciente.
                        </p>
                      ) : (
                        patientAppointments.map((item) => {
                          const isCurrent = item.id === selectedAppointmentId
                          const isExpanded = item.id === selectedHistoryAppointmentId
                          return (
                            <article
                              key={item.id}
                              className={cn(
                                'rounded-xl border bg-card p-4 shadow-sm',
                                isCurrent && 'border-primary/50 bg-primary/5',
                              )}
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold">{item.service_type_name ?? 'Cita'}</p>
                                <Badge variant={APPOINTMENT_STATUS_VARIANTS[item.status] ?? 'outline'} className="text-[10px]">
                                  {APPOINTMENT_STATUS_LABELS[item.status] ?? item.status}
                                </Badge>
                                {isCurrent ? (
                                  <Badge variant="secondary" className="text-[10px]">
                                    Cita actual
                                  </Badge>
                                ) : null}
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {new Date(item.scheduled_at).toLocaleString('es-CL', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                })}
                                {item.duration_minutes ? ` - ${item.duration_minutes} min` : ''}
                              </p>
                              {item.worker_name ? (
                                <p className="mt-1 text-xs text-muted-foreground">Profesional: {item.worker_name}</p>
                              ) : null}
                              {item.chief_complaint ? (
                                <p className="mt-2 text-sm text-foreground/90">Motivo: {item.chief_complaint}</p>
                              ) : null}
                              <div className="mt-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedHistoryAppointmentId((prev) => (prev === item.id ? '' : item.id))
                                  }
                                >
                                  {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                                </Button>
                              </div>

                              {isExpanded ? (
                                <div className="mt-3 space-y-3 rounded-lg border bg-muted/20 p-3">
                                  {loadingHistoryAppointmentDetail ? (
                                    <p className="text-xs text-muted-foreground">Cargando detalle de la cita...</p>
                                  ) : selectedHistoryAppointment && selectedHistoryAppointment.id === item.id ? (
                                    <>
                                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded-md border bg-background p-2">
                                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Fecha</p>
                                          <p className="mt-1 text-xs font-medium">
                                            {new Date(selectedHistoryAppointment.scheduled_at).toLocaleString('es-CL', {
                                              year: 'numeric',
                                              month: '2-digit',
                                              day: '2-digit',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                              hour12: false,
                                            })}
                                          </p>
                                        </div>
                                        <div className="rounded-md border bg-background p-2">
                                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Duracion</p>
                                          <p className="mt-1 text-xs font-medium">
                                            {selectedHistoryAppointment.duration_minutes
                                              ? `${selectedHistoryAppointment.duration_minutes} min`
                                              : 'No definida'}
                                          </p>
                                        </div>
                                        <div className="rounded-md border bg-background p-2">
                                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Profesional</p>
                                          <p className="mt-1 text-xs font-medium">
                                            {selectedHistoryAppointment.worker_name ?? 'Sin asignar'}
                                          </p>
                                        </div>
                                        <div className="rounded-md border bg-background p-2">
                                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Modalidad</p>
                                          <p className="mt-1 text-xs font-medium">
                                            {selectedHistoryAppointment.company_id ? 'Empresa' : 'Particular'}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="grid gap-3 sm:grid-cols-2">
                                        {selectedHistoryAppointment.chief_complaint ? (
                                          <div className="rounded-md border bg-background p-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                              Motivo de consulta
                                            </p>
                                            <p className="mt-1 text-sm whitespace-pre-wrap">
                                              {selectedHistoryAppointment.chief_complaint}
                                            </p>
                                          </div>
                                        ) : null}
                                        {selectedHistoryAppointment.subjective ? (
                                          <div className="rounded-md border bg-background p-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                              Subjetivo
                                            </p>
                                            <p className="mt-1 text-sm whitespace-pre-wrap">
                                              {selectedHistoryAppointment.subjective}
                                            </p>
                                          </div>
                                        ) : null}
                                        {selectedHistoryAppointment.objective ? (
                                          <div className="rounded-md border bg-background p-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                              Objetivo
                                            </p>
                                            <p className="mt-1 text-sm whitespace-pre-wrap">
                                              {selectedHistoryAppointment.objective}
                                            </p>
                                          </div>
                                        ) : null}
                                        {selectedHistoryAppointment.assessment ? (
                                          <div className="rounded-md border bg-background p-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                              Evaluacion
                                            </p>
                                            <p className="mt-1 text-sm whitespace-pre-wrap">
                                              {selectedHistoryAppointment.assessment}
                                            </p>
                                          </div>
                                        ) : null}
                                        {selectedHistoryAppointment.plan ? (
                                          <div className="rounded-md border bg-background p-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                              Plan
                                            </p>
                                            <p className="mt-1 text-sm whitespace-pre-wrap">
                                              {selectedHistoryAppointment.plan}
                                            </p>
                                          </div>
                                        ) : null}
                                        {selectedHistoryAppointment.notes ? (
                                          <div className="rounded-md border bg-background p-3">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                              Notas
                                            </p>
                                            <p className="mt-1 text-sm whitespace-pre-wrap">
                                              {selectedHistoryAppointment.notes}
                                            </p>
                                          </div>
                                        ) : null}
                                      </div>
                                      {selectedHistoryAppointment.follow_up_required ? (
                                        <div className="rounded-md border border-amber-300 bg-amber-50 p-2">
                                          <p className="text-xs font-medium text-amber-800">Seguimiento requerido</p>
                                          <p className="text-xs text-amber-900">
                                            {selectedHistoryAppointment.follow_up_date
                                              ? `Fecha: ${selectedHistoryAppointment.follow_up_date.slice(0, 10)}`
                                              : 'Sin fecha definida'}
                                          </p>
                                          {selectedHistoryAppointment.follow_up_notes ? (
                                            <p className="mt-1 text-xs text-amber-900">
                                              {selectedHistoryAppointment.follow_up_notes}
                                            </p>
                                          ) : null}
                                        </div>
                                      ) : null}

                                      {!selectedHistoryAppointment.subjective &&
                                      !selectedHistoryAppointment.objective &&
                                      !selectedHistoryAppointment.assessment &&
                                      !selectedHistoryAppointment.plan &&
                                      !selectedHistoryAppointment.notes &&
                                      !selectedHistoryAppointment.chief_complaint &&
                                      !selectedHistoryAppointment.follow_up_required ? (
                                        <p className="text-xs text-muted-foreground">
                                          Esta cita no tiene detalle clinico registrado.
                                        </p>
                                      ) : null}
                                    </>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      No se pudo cargar el detalle de esta cita.
                                    </p>
                                  )}
                                </div>
                              ) : null}
                            </article>
                          )
                        })
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="clinical" className="mt-0">
                    <div className="space-y-4">
                      {!canViewPatient ? (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          No tienes permisos para ver historial clinico del paciente.
                        </p>
                      ) : loadingPatientClinicalRecord ? (
                        <p className="text-sm text-muted-foreground">Cargando historial clinico...</p>
                      ) : !patientClinicalRecord ? (
                        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                          Este paciente aun no tiene ficha clinica registrada.
                        </p>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                          {patientClinicalRecord.main_diagnosis ? (
                            <div className="rounded-xl border bg-card p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Diagnostico principal</p>
                              <p className="mt-2 text-sm whitespace-pre-wrap">{patientClinicalRecord.main_diagnosis}</p>
                            </div>
                          ) : null}
                          {patientClinicalRecord.relevant_history ? (
                            <div className="rounded-xl border bg-card p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Antecedentes relevantes</p>
                              <p className="mt-2 text-sm whitespace-pre-wrap">{patientClinicalRecord.relevant_history}</p>
                            </div>
                          ) : null}
                          {patientClinicalRecord.family_history ? (
                            <div className="rounded-xl border bg-card p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Antecedentes familiares</p>
                              <p className="mt-2 text-sm whitespace-pre-wrap">{patientClinicalRecord.family_history}</p>
                            </div>
                          ) : null}
                          {patientClinicalRecord.current_medications ? (
                            <div className="rounded-xl border bg-card p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Medicamentos actuales</p>
                              <p className="mt-2 text-sm whitespace-pre-wrap">{patientClinicalRecord.current_medications}</p>
                            </div>
                          ) : null}
                          {patientClinicalRecord.allergies ? (
                            <div className="rounded-xl border bg-card p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Alergias</p>
                              <p className="mt-2 text-sm whitespace-pre-wrap">{patientClinicalRecord.allergies}</p>
                            </div>
                          ) : null}
                          {patientClinicalRecord.physical_restrictions ? (
                            <div className="rounded-xl border bg-card p-4">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Restricciones fisicas</p>
                              <p className="mt-2 text-sm whitespace-pre-wrap">{patientClinicalRecord.physical_restrictions}</p>
                            </div>
                          ) : null}
                          {patientClinicalRecord.alerts ? (
                            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 md:col-span-2">
                              <p className="text-xs uppercase tracking-wide text-amber-800">Alertas</p>
                              <p className="mt-2 text-sm whitespace-pre-wrap text-amber-900">{patientClinicalRecord.alerts}</p>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
