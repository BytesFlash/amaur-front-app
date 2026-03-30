import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { useAppointment, useCreateAppointment, useUpdateAppointment } from '../hooks/useAppointments'
import { usePatients } from '@/modules/patients/hooks/usePatients'
import { useWorkers } from '@/modules/workers/hooks/useWorkers'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { toast } from 'sonner'

const schema = z.object({
  patient_id: z.string().min(1, 'Requerido'),
  service_type_id: z.string().min(1, 'Requerido'),
  worker_id: z.string().optional(),
  scheduled_at: z.string().min(1, 'Requerido'), // datetime-local value
  duration_minutes: z.coerce.number().int().min(1).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : Number(v))),
  notes: z.string().optional(),
  session_count: z.coerce.number().int().min(1).max(52).default(1),
  frequency_weeks: z.coerce.number().int().min(1).default(1),
})

type FormValues = z.infer<typeof schema>

function buildRecurringDates(scheduledAt: string, sessionCount: number, frequencyWeeks: number): Date[] {
  if (!scheduledAt || isNaN(Date.parse(scheduledAt))) return []
  const first = new Date(scheduledAt)
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

  const { data: appointment } = useAppointment(id ?? '')
  const createMutation = useCreateAppointment()
  const updateMutation = useUpdateAppointment(id ?? '')

  const { data: patientsData } = usePatients({ limit: 300 } as Parameters<typeof usePatients>[0])
  const patients = patientsData?.data ?? []

  const { data: workersData } = useWorkers({ active: true, limit: 200 } as Parameters<typeof useWorkers>[0])
  const workers = workersData?.data ?? []

  const { data: serviceTypes = [] } = useServiceTypes()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: '',
      service_type_id: '',
      worker_id: '',
      scheduled_at: '',
      session_count: 1,
      frequency_weeks: 1,
    },
  })

  const watchedScheduledAt = watch('scheduled_at')
  const watchedSessionCount = watch('session_count')
  const watchedFrequencyWeeks = watch('frequency_weeks')

  const previewDates = useMemo(
    () => buildRecurringDates(watchedScheduledAt, watchedSessionCount, watchedFrequencyWeeks),
    [watchedScheduledAt, watchedSessionCount, watchedFrequencyWeeks],
  )

  useEffect(() => {
    if (appointment && isEdit) {
      const dt = new Date(appointment.scheduled_at)
      // format as "YYYY-MM-DDTHH:MM" for datetime-local
      const pad = (n: number) => String(n).padStart(2, '0')
      const local = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
      reset({
        patient_id: appointment.patient_id,
        service_type_id: appointment.service_type_id,
        worker_id: appointment.worker_id ?? '',
        scheduled_at: local,
        duration_minutes: appointment.duration_minutes ?? ('' as unknown as undefined),
        notes: appointment.notes ?? '',
        session_count: 1,
        frequency_weeks: 1,
      })
    }
  }, [appointment, reset, isEdit])

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          worker_id: values.worker_id || undefined,
          service_type_id: values.service_type_id || undefined,
          scheduled_at: values.scheduled_at,
          duration_minutes: values.duration_minutes as number | undefined,
          notes: values.notes || undefined,
        })
        toast.success('Cita actualizada')
        navigate('/appointments')
      } else {
        await createMutation.mutateAsync({
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
        navigate('/appointments')
      }
    } catch {
      toast.error('Error al guardar la cita')
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
                      onValueChange={v => field.onChange(v === 'none' ? '' : v)}
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
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Date/time */}
            <div className="flex flex-col gap-1.5">
              <Label>Fecha y hora *</Label>
              <Input type="datetime-local" {...register('scheduled_at')} />
              {errors.scheduled_at && <p className="text-xs text-destructive">{errors.scheduled_at.message}</p>}
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <Label>Duración (minutos)</Label>
              <Input type="number" min={1} placeholder="60" {...register('duration_minutes')} />
            </div>

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
      </form>
    </div>
  )
}
