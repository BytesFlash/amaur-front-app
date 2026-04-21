import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import axios from 'axios'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { cn } from '@/shared/utils/cn'
import { usePermission } from '@/shared/hooks/usePermission'
import { useAppointment, useCreateAppointment, useDeleteAppointment, useUpdateAppointment } from '../hooks/useAppointments'
import { usePatients } from '@/modules/patients/hooks/usePatients'
import { useWorker, useWorkers, useWorkerSlots } from '@/modules/workers/hooks/useWorkers'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { toast } from 'sonner'
import { APPOINTMENT_STATUS_OPTIONS } from '../lib/status'

const schema = z.object({
  patient_id: z.string().min(1, 'Requerido'),
  service_type_id: z.string().min(1, 'Requerido'),
  worker_id: z.string().optional(),
  scheduled_at: z.string().min(1, 'Requerido'), // datetime-local value
  status: z.string().optional(),
  duration_minutes: z.coerce.number().int().min(1).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : Number(v))),
  notes: z.string().optional(),
  session_count: z.coerce.number().int().min(1).max(52).default(1),
  frequency_weeks: z.coerce.number().int().min(1).default(1),
})

type FormValues = z.infer<typeof schema>

function parseLocalDateTime(value: string): Date | null {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    const hour = Number(match[4] ?? '0')
    const minute = Number(match[5] ?? '0')
    const second = Number(match[6] ?? '0')
    return new Date(year, month, day, hour, minute, second, 0)
  }
  const dt = new Date(value)
  return Number.isNaN(dt.getTime()) ? null : dt
}

function toDateTimeLocalInput(value: string): string {
  const dt = parseLocalDateTime(value)
  if (!dt) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

function formatDateOnlyLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getMondayStr(d: Date): string {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return formatDateOnlyLocal(monday)
}

function addWeeks(dateStr: string, weeks: number): string {
  const dt = parseLocalDateTime(`${dateStr}T00:00`)
  if (!dt) return dateStr
  dt.setDate(dt.getDate() + weeks * 7)
  return formatDateOnlyLocal(dt)
}

function mondayForDateTimeLocal(value: string): string | null {
  const dt = parseLocalDateTime(value)
  if (!dt) return null
  return getMondayStr(dt)
}

function formatDateColumn(dateStr: string): string {
  const dt = parseLocalDateTime(`${dateStr}T00:00`)
  if (!dt) return dateStr
  const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
  return `${days[dt.getDay()]} ${dt.getDate()}`
}

function formatWeekRange(weekStart: string): string {
  const start = parseLocalDateTime(`${weekStart}T00:00`)
  if (!start) return weekStart
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const formatter = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' })
  const withYear = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${start.getDate()}-${end.getDate()} ${withYear.format(end)}`
  }
  return `${formatter.format(start)} - ${withYear.format(end)}`
}

function formatScheduledAt(value: string): string {
  const dt = parseLocalDateTime(value)
  if (!dt) return '-'
  return dt.toLocaleString('es-CL', { dateStyle: 'full', timeStyle: 'short' })
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? fallback
  }
  return fallback
}

function buildRecurringDates(scheduledAt: string, sessionCount: number, frequencyWeeks: number): Date[] {
  const first = parseLocalDateTime(scheduledAt)
  if (!first) return []
  const dates: Date[] = []
  for (let i = 0; i < sessionCount; i++) {
    const d = new Date(first)
    d.setDate(d.getDate() + i * frequencyWeeks * 7)
    dates.push(d)
  }
  return dates
}

export function AppointmentFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const { hasPermission, hasRole } = usePermission()
  const canDelete = isEdit && (hasPermission('appointments:delete') || hasRole('super_admin'))

  const { data: appointment } = useAppointment(id ?? '')
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment(id ?? '')
  const deleteMutation = useDeleteAppointment()

  const { data: patientsData } = usePatients({ limit: 300 } as Parameters<typeof usePatients>[0])
  const patients = patientsData?.data ?? []

  const workersQueryParams = useMemo(
    () =>
      (isEdit
        ? ({ active: false, limit: 500 } as Parameters<typeof useWorkers>[0])
        : ({ active: true, limit: 200 } as Parameters<typeof useWorkers>[0])),
    [isEdit],
  )
  const { data: workersData } = useWorkers(workersQueryParams)

  const { data: serviceTypes = [] } = useServiceTypes(isEdit ? false : true)
  const currentWeekStart = useMemo(() => getMondayStr(new Date()), [])
  const [slotDialogOpen, setSlotDialogOpen] = useState(false)
  const [slotWeekStart, setSlotWeekStart] = useState(currentWeekStart)
  const [weekSearchCount, setWeekSearchCount] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: '',
      service_type_id: '',
      worker_id: '',
      scheduled_at: '',
      status: 'requested',
      session_count: 1,
      frequency_weeks: 1,
    },
  })

  const watchedScheduledAt = watch('scheduled_at')
  const watchedSessionCount = watch('session_count')
  const watchedFrequencyWeeks = watch('frequency_weeks')
  const watchedWorkerId = watch('worker_id')
  const watchedDuration = watch('duration_minutes')
  const selectedWorkerIdForFetch = watchedWorkerId || appointment?.worker_id || ''
  const { data: selectedWorkerFallback } = useWorker(selectedWorkerIdForFetch)
  const workers = useMemo(() => {
    const baseWorkers = workersData?.data ?? []
    if (!selectedWorkerFallback) return baseWorkers
    if (baseWorkers.some((worker) => worker.id === selectedWorkerFallback.id)) return baseWorkers
    return [selectedWorkerFallback, ...baseWorkers]
  }, [workersData?.data, selectedWorkerFallback])
  const slotDuration = useMemo(() => {
    const candidate = Number(watchedDuration ?? 60)
    return Number.isFinite(candidate) && candidate > 0 ? candidate : 60
  }, [watchedDuration])
  const selectedWorker = useMemo(
    () => workers.find((w) => w.id === watchedWorkerId),
    [workers, watchedWorkerId],
  )

  const { data: slots = [], isFetching: loadingSlots } = useWorkerSlots(
    watchedWorkerId || '',
    slotWeekStart,
    slotDuration,
  )

  const slotsByDate = useMemo(() => {
    const source = Array.isArray(slots) ? slots : []
    const grouped: Record<string, typeof source> = {}
    for (const slot of source) {
      if (!slot.available) continue
      if (!grouped[slot.date]) grouped[slot.date] = []
      grouped[slot.date].push(slot)
    }
    return grouped
  }, [slots])

  const orderedSlotDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate])

  const previewDates = useMemo(
    () => buildRecurringDates(watchedScheduledAt, watchedSessionCount, watchedFrequencyWeeks),
    [watchedScheduledAt, watchedSessionCount, watchedFrequencyWeeks],
  )

  useEffect(() => {
    if (appointment && isEdit) {
      const local = toDateTimeLocalInput(appointment.scheduled_at)
      const appointmentWeek = mondayForDateTimeLocal(local)
      reset({
        patient_id: appointment.patient_id,
        service_type_id: appointment.service_type_id,
        worker_id: appointment.worker_id ?? '',
        scheduled_at: local,
        status: appointment.status,
        duration_minutes: appointment.duration_minutes ?? ('' as unknown as undefined),
        notes: appointment.notes ?? '',
        session_count: 1,
        frequency_weeks: 1,
      })
      if (appointmentWeek) {
        setSlotWeekStart(appointmentWeek < currentWeekStart ? currentWeekStart : appointmentWeek)
      }
    }
  }, [appointment, reset, isEdit, currentWeekStart])

  useEffect(() => {
    if (!slotDialogOpen || !watchedWorkerId || loadingSlots) return
    if (orderedSlotDates.length > 0) {
      if (weekSearchCount !== 0) setWeekSearchCount(0)
      return
    }
    if (weekSearchCount >= 8) return
    setWeekSearchCount((prev) => prev + 1)
    setSlotWeekStart((prev) => addWeeks(prev, 1))
  }, [slotDialogOpen, watchedWorkerId, loadingSlots, orderedSlotDates.length, weekSearchCount])

  function openSlotsDialog() {
    const existingWeek = mondayForDateTimeLocal(watchedScheduledAt)
    const normalizedWeek = existingWeek && existingWeek >= currentWeekStart ? existingWeek : currentWeekStart
    setSlotWeekStart(normalizedWeek)
    setWeekSearchCount(0)
    setSlotDialogOpen(true)
  }

  async function handleDeleteAppointment() {
    if (!id) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Cita eliminada')
      navigate('/app/appointments')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar la cita'))
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          worker_id: values.worker_id || undefined,
          service_type_id: values.service_type_id || undefined,
          scheduled_at: values.scheduled_at,
          status: values.status || undefined,
          duration_minutes: values.duration_minutes as number | undefined,
          notes: values.notes || undefined,
        })
        toast.success('Cita actualizada')
        navigate(`/app/appointments/${id}`)
      } else {
        const created = await createMutation.mutateAsync({
          patient_id: values.patient_id,
          service_type_id: values.service_type_id,
          worker_id: values.worker_id || undefined,
          scheduled_at: values.scheduled_at,
          duration_minutes: values.duration_minutes as number | undefined,
          notes: values.notes || undefined,
          session_count: values.session_count,
          frequency_weeks: values.frequency_weeks,
        })
        toast.success(
          values.session_count > 1
            ? `${values.session_count} citas agendadas`
            : 'Cita agendada',
        )
        if (values.session_count === 1 && created[0]) {
          navigate(`/app/appointments/${created[0].id}`)
        } else {
          navigate('/app/appointments')
        }
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Error al guardar la cita'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={isEdit ? 'Editar cita' : 'Nueva cita'} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de la cita</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Patient */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Paciente *</Label>
              <Controller
                control={control}
                name="patient_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.first_name} {p.last_name}
                          {p.rut ? ` · ${p.rut}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
            </div>

            {/* Service type */}
            <div className="flex flex-col gap-1.5">
              <Label>Tipo de servicio *</Label>
              <Controller
                control={control}
                name="service_type_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona servicio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.service_type_id && <p className="text-xs text-destructive">{errors.service_type_id.message}</p>}
            </div>

            {/* Worker */}
            <div className="flex flex-col gap-1.5">
              <Label>Profesional</Label>
              <Controller
                control={control}
                name="worker_id"
                render={({ field }) => (
                  <Select
                      onValueChange={v => {
                        field.onChange(v === 'none' ? '' : v)
                        setWeekSearchCount(0)
                      }}
                      value={field.value || 'none'}
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {workers.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.first_name} {w.last_name}
                          {w.role_title ? ` - ${w.role_title}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Date/time */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Fecha y hora *</Label>
                {watchedWorkerId ? (
                  <Button type="button" variant="outline" size="sm" onClick={openSlotsDialog}>
                    Ver bloques
                  </Button>
                ) : null}
              </div>
              <Input type="datetime-local" {...register('scheduled_at')} />
              {watchedScheduledAt ? (
                <p className="text-xs text-muted-foreground">
                  Horario asignado:{' '}
                  <span className="font-medium text-foreground">
                    {formatScheduledAt(watchedScheduledAt)}
                  </span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Aun no hay horario seleccionado.
                </p>
              )}
              {selectedWorker ? (
                <p className="text-xs text-muted-foreground">
                  Profesional: {selectedWorker.first_name} {selectedWorker.last_name}. Duracion usada para bloques: {slotDuration} min.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Selecciona un profesional para abrir los bloques disponibles.
                </p>
              )}
              {errors.scheduled_at && <p className="text-xs text-destructive">{errors.scheduled_at.message}</p>}
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <Label>Duración (minutos)</Label>
              <Input type="number" min={1} placeholder="60" {...register('duration_minutes')} />
            </div>

            {isEdit && (
              <div className="flex flex-col gap-1.5">
                <Label>Estado</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona estado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}

            {/* Notes */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Notas</Label>
              <Textarea {...register('notes')} rows={2} placeholder="Indicaciones, observaciones..." />
            </div>
          </CardContent>
        </Card>

        {/* Recurring (only on create) */}
        {!isEdit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Sesiones recurrentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>Cantidad de sesiones</Label>
                  <Input type="number" min={1} max={52} {...register('session_count')} />
                  <p className="text-xs text-muted-foreground">1 = cita única</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Frecuencia (semanas)</Label>
                  <Controller
                    control={control}
                    name="frequency_weeks"
                    render={({ field }) => (
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Semanal (cada 1 semana)</SelectItem>
                          <SelectItem value="2">Quincenal (cada 2 semanas)</SelectItem>
                          <SelectItem value="3">Cada 3 semanas</SelectItem>
                          <SelectItem value="4">Mensual (cada 4 semanas)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Date preview */}
              {previewDates.length > 1 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Vista previa de fechas:</p>
                  <div className="flex flex-wrap gap-2">
                    {previewDates.map((d, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {d.toLocaleDateString('es-CL', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                        })}{' '}
                        {d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className={cn('flex flex-col-reverse gap-3 sm:flex-row', canDelete ? 'sm:justify-between' : 'sm:justify-end')}>
          {canDelete ? (
            <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar cita
            </Button>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEdit
                ? 'Guardar cambios'
                : watchedSessionCount > 1
                ? `Agendar ${watchedSessionCount} sesiones`
                : 'Agendar cita'}
            </Button>
          </div>
        </div>
      </form>

      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Seleccion de bloques horarios</DialogTitle>
            <DialogDescription>
              Elige una hora libre del profesional para evitar conflictos al guardar.
            </DialogDescription>
          </DialogHeader>

          {!watchedWorkerId ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Selecciona primero un profesional para cargar sus bloques.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={slotWeekStart <= currentWeekStart}
                  onClick={() => {
                    setWeekSearchCount(0)
                    setSlotWeekStart((prev) => addWeeks(prev, -1))
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <p className="text-sm font-medium">{formatWeekRange(slotWeekStart)}</p>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setWeekSearchCount(0)
                    setSlotWeekStart((prev) => addWeeks(prev, 1))
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {loadingSlots ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Cargando bloques...
                </div>
              ) : orderedSlotDates.length === 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-medium text-amber-800">No hay bloques disponibles en esta semana.</p>
                  <p className="mt-1 text-xs text-amber-700">
                    Buscamos automaticamente en semanas siguientes para mostrar la primera opcion valida.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto pb-2">
                  <div className="inline-flex min-w-full gap-2">
                    {orderedSlotDates.map((date) => (
                      <div key={date} className="flex min-w-[90px] flex-1 flex-col gap-1">
                        <div className="rounded-md bg-muted px-2 py-1 text-center text-xs font-medium">
                          {formatDateColumn(date)}
                        </div>
                        {slotsByDate[date].map((slot) => {
                          const slotKey = `${slot.date}T${slot.start_time}`
                          const isSelected = watchedScheduledAt === slotKey
                          return (
                            <Button
                              key={slotKey}
                              type="button"
                              variant={isSelected ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setValue('scheduled_at', slotKey, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                })
                                setSlotDialogOpen(false)
                              }}
                              className={cn(
                                'h-8 text-xs',
                                isSelected
                                  ? ''
                                  : 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100 hover:text-green-900',
                              )}
                            >
                              {slot.start_time}
                            </Button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cita</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara la cita de forma permanente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAppointment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
