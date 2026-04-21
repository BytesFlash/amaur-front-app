import { useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useCareSession, useCreateCareSession, useUpdateCareSession } from '../hooks/useCareSessions'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { useWorkers } from '@/modules/workers/hooks/useWorkers'
import { usePatients } from '@/modules/patients/hooks/usePatients'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { toast } from 'sonner'

const schema = z.object({
  patient_id: z.string().min(1, 'Selecciona un paciente'),
  worker_id: z.string().min(1, 'Selecciona un profesional'),
  service_type_id: z.string().min(1, 'Selecciona un tipo de servicio'),
  company_id: z.string().optional(),
  session_type: z.enum(['company_visit', 'particular']),
  session_date: z.string().min(1, 'Requerido'),
  session_time: z.string().optional(),
  duration_minutes: z.coerce.number().min(1).optional().or(z.literal('')),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
})

type FormValues = z.infer<typeof schema>

export function CareSessionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const isEdit = !!id

  const searchParams = new URLSearchParams(location.search)
  const prePatientId = searchParams.get('patient_id') ?? ''
  const preWorkerId = searchParams.get('worker_id') ?? ''
  const preServiceTypeId = searchParams.get('service_type_id') ?? ''
  const preSessionDate = searchParams.get('session_date') ?? ''
  const preSessionTime = searchParams.get('session_time') ?? ''
  const preAppointmentId = searchParams.get('appointment_id') ?? ''

  const { data: existing } = useCareSession(id ?? '')
  const createMutation = useCreateCareSession()
  const updateMutation = useUpdateCareSession(id ?? '')

  const { data: serviceTypes } = useServiceTypes(true)
  const { data: workersRes } = useWorkers({ active: true, limit: 200 })
  const { data: patientsRes } = usePatients({ limit: 200 })
  const { data: companiesRes } = useCompanies({ limit: 200 })

  const serviceTypeList = serviceTypes ?? []
  const workers = (workersRes as any)?.data ?? []
  const patients = (patientsRes as any)?.data ?? []
  const companies = (companiesRes as any)?.data ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: prePatientId,
      worker_id: preWorkerId,
      service_type_id: preServiceTypeId,
      session_date: preSessionDate,
      session_time: preSessionTime,
      session_type: 'particular',
      status: 'scheduled',
      notes: preAppointmentId ? `Atencion iniciada desde cita ${preAppointmentId}` : '',
    },
  })

  const sessionType = watch('session_type')

  useEffect(() => {
    if (existing) {
      setValue('patient_id', existing.patient_id)
      setValue('worker_id', existing.worker_id)
      setValue('service_type_id', existing.service_type_id)
      setValue('company_id', existing.company_id ?? '')
      setValue('session_type', existing.session_type as 'company_visit' | 'particular')
      setValue('session_date', existing.session_date?.slice(0, 10) ?? '')
      setValue('session_time', existing.session_time ?? '')
      setValue('duration_minutes', existing.duration_minutes as any ?? '')
      setValue('notes', existing.notes ?? '')
      setValue('status', existing.status as any)
    }
  }, [existing, setValue])

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        company_id: values.company_id || undefined,
        duration_minutes: values.duration_minutes === '' ? undefined : Number(values.duration_minutes),
      }
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        toast.success('Atencion actualizada')
        navigate(-1)
      } else {
        const created = await createMutation.mutateAsync(payload as any)
        toast.success('Atencion creada')
        navigate(`/care-sessions/${(created as any).id ?? ''}`, { replace: true })
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al guardar')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Editar atencion' : 'Registro de atencion (legado)'}
        description={isEdit ? 'Modifica los datos de la sesion' : 'Flujo histórico. Se recomienda registrar desde citas individuales.'}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Informacion basica</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Paciente *</Label>
                <Select
                  onValueChange={(v) => setValue('patient_id', v)}
                  value={watch('patient_id')}
                  disabled={isEdit}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar paciente..." /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.first_name} {p.last_name} — {p.rut}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patient_id && <p className="text-xs text-destructive">{errors.patient_id.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Profesional *</Label>
                <Select onValueChange={(v) => setValue('worker_id', v)} value={watch('worker_id')}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar profesional..." /></SelectTrigger>
                  <SelectContent>
                    {workers.map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.first_name} {w.last_name}{w.role_title ? ` — ${w.role_title}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.worker_id && <p className="text-xs text-destructive">{errors.worker_id.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tipo de servicio *</Label>
                <Select onValueChange={(v) => setValue('service_type_id', v)} value={watch('service_type_id')}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar servicio..." /></SelectTrigger>
                  <SelectContent>
                    {serviceTypeList.map((st: any) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.name}{st.category ? ` (${st.category})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.service_type_id && <p className="text-xs text-destructive">{errors.service_type_id.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Tipo de sesion *</Label>
                <Select
                  onValueChange={(v) => setValue('session_type', v as 'company_visit' | 'particular')}
                  value={sessionType}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="company_visit">Visita empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {sessionType === 'company_visit' && (
              <div className="space-y-1">
                <Label>Empresa</Label>
                <Select
                  onValueChange={(v) => setValue('company_id', v === 'none' ? '' : v)}
                  value={watch('company_id') || 'none'}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar empresa..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguna</SelectItem>
                    {companies.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.fantasy_name ?? c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Fecha *</Label>
                <Input type="date" {...register('session_date')} />
                {errors.session_date && <p className="text-xs text-destructive">{errors.session_date.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Hora</Label>
                <Input type="time" {...register('session_time')} />
              </div>
              <div className="space-y-1">
                <Label>Duracion (min)</Label>
                <Input type="number" min={1} placeholder="45" {...register('duration_minutes')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Estado</Label>
              <Select onValueChange={(v) => setValue('status', v as any)} value={watch('status')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Programada</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                  <SelectItem value="no_show">Inasistencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Notas generales</Label>
              <Textarea rows={3} {...register('notes')} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear atencion'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
