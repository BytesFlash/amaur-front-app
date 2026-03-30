import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useVisit, useCreateVisit, useUpdateVisit } from '../hooks/useVisits'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { useContracts } from '@/modules/contracts/hooks/useContracts'
import { useWorkers } from '@/modules/workers/hooks/useWorkers'
import { useSpecialties } from '@/shared/hooks/useSpecialties'
import { toast } from 'sonner'

const schema = z.object({
  company_id: z.string().min(1, 'Selecciona una empresa'),
  contract_id: z.string().optional(),
  scheduled_date: z.string().min(1, 'Requerido'),
  scheduled_start: z.string().optional(),
  scheduled_end: z.string().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  general_notes: z.string().optional(),
  cancellation_reason: z.string().optional(),
  internal_report: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada', in_progress: 'En curso', completed: 'Completada',
  cancelled: 'Cancelada', no_show: 'Inasistencia',
}

export function VisitFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const { data: visit } = useVisit(id ?? '')
  const createMutation = useCreateVisit()
  const updateMutation = useUpdateVisit(id ?? '')

  const { data: companiesData } = useCompanies({ limit: 200 } as Parameters<typeof useCompanies>[0])
  const companies = companiesData?.data ?? []

  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const { data: contractsData } = useContracts({ company_id: selectedCompanyId, limit: 50 } as Parameters<typeof useContracts>[0])
  const contracts = contractsData?.data ?? []

  const { data: workersData } = useWorkers({ active: true, limit: 200 } as Parameters<typeof useWorkers>[0])
  const allWorkers = workersData?.data ?? []
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([])
  const [workerSpecialtyFilter, setWorkerSpecialtyFilter] = useState('')
  const { data: specialtyCatalog = [] } = useSpecialties()

  // Filter workers by specialty client-side using the specialties[] array on each worker
  const filteredWorkers = workerSpecialtyFilter
    ? allWorkers.filter((w) =>
        w.specialties?.some((s) => s.code === workerSpecialtyFilter),
      )
    : allWorkers

  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { company_id: '', scheduled_date: '' } })

  const watchedCompany = watch('company_id')
  useEffect(() => {
    setSelectedCompanyId(watchedCompany ?? '')
    if (!isEdit) setValue('contract_id', '')
  }, [watchedCompany, setValue, isEdit])

  useEffect(() => {
    if (visit && isEdit) {
      reset({
        company_id: visit.company_id,
        contract_id: visit.contract_id ?? '',
        scheduled_date: visit.scheduled_date.slice(0, 10),
        scheduled_start: visit.scheduled_start ?? '',
        scheduled_end: visit.scheduled_end ?? '',
        status: visit.status,
        general_notes: visit.general_notes ?? '',
        cancellation_reason: visit.cancellation_reason ?? '',
        internal_report: visit.internal_report ?? '',
      })
      setSelectedCompanyId(visit.company_id)
      if (visit.workers) setSelectedWorkerIds(visit.workers.map((w) => w.worker_id))
    }
  }, [visit, isEdit, reset])

  function toggleWorker(wid: string) {
    setSelectedWorkerIds((prev) => prev.includes(wid) ? prev.filter((x) => x !== wid) : [...prev, wid])
  }

  async function onSubmit(values: FormValues) {
    const payload = { ...values, contract_id: values.contract_id || undefined, worker_ids: selectedWorkerIds }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        toast.success('Agenda actualizada')
      } else {
        await createMutation.mutateAsync(payload as Parameters<typeof createMutation.mutateAsync>[0])
        toast.success('Agenda creada')
      }
      navigate('/agendas')
    } catch {
      toast.error('Error al guardar la agenda')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={isEdit ? 'Editar agenda' : 'Nueva agenda'} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader><CardTitle className="text-base">Programacion</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Empresa *" error={errors.company_id?.message} className="sm:col-span-2">
              <Controller control={control} name="company_id" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue placeholder="Selecciona empresa..." /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.fantasy_name ? `${c.fantasy_name} (${c.name})` : c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </Field>
            {selectedCompanyId && (
              <Field label="Contrato" className="sm:col-span-2">
                <Controller control={control} name="contract_id" render={({ field }) => (
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Sin contrato especifico" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin contrato</SelectItem>
                      {contracts.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </Field>
            )}
            <Field label="Fecha *" error={errors.scheduled_date?.message}>
              <Input type="date" {...register('scheduled_date')} />
            </Field>
            {isEdit && (
              <Field label="Estado">
                <Controller control={control} name="status" render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )} />
              </Field>
            )}
            <Field label="Hora inicio"><Input type="time" {...register('scheduled_start')} /></Field>
            <Field label="Hora fin"><Input type="time" {...register('scheduled_end')} /></Field>
            <Field label="Notas generales" className="sm:col-span-2">
              <Textarea rows={3} {...register('general_notes')} />
            </Field>
            {isEdit && (
              <>
                <Field label="Motivo de cancelacion" className="sm:col-span-2">
                  <Input {...register('cancellation_reason')} />
                </Field>
                <Field label="Informe interno" className="sm:col-span-2">
                  <Textarea rows={4} {...register('internal_report')} />
                </Field>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Equipo AMAUR asignado</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Filtrar por especialidad</Label>
              <Select
                value={workerSpecialtyFilter || 'all'}
                onValueChange={(v) => setWorkerSpecialtyFilter(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="mt-1 w-56">
                  <SelectValue placeholder="Todas las especialidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las especialidades</SelectItem>
                  {specialtyCatalog.map((sp) => (
                    <SelectItem key={sp.code} value={sp.code}>{sp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredWorkers.map((w) => {
                const selected = selectedWorkerIds.includes(w.id)
                return (
                  <button key={w.id} type="button" onClick={() => toggleWorker(w.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    {w.first_name} {w.last_name}
                    {w.role_title && <span className="text-xs opacity-60"> {w.role_title}</span>}
                    {selected && <X className="h-3 w-3" />}
                  </button>
                )
              })}
              {filteredWorkers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {workerSpecialtyFilter ? 'No hay profesionales con esa especialidad.' : 'No hay profesionales.'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Guardar cambios' : 'Crear agenda'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
