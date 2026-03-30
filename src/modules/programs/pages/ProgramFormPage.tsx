import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useProgram, useCreateProgram, useUpdateProgram } from '../hooks/usePrograms'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { useContracts } from '@/modules/contracts/hooks/useContracts'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { toast } from 'sonner'

const WEEKDAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const ruleSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  start_time: z.string().min(1, 'Requerido'),
  duration_minutes: z.coerce.number().int().min(1, 'Mín. 1 min'),
  frequency_interval_weeks: z.coerce.number().int().min(1).default(1),
  max_occurrences: z.coerce.number().int().min(1).optional().or(z.literal('')).transform((v) => (v === '' ? undefined : Number(v))),
  service_type_id: z.string().optional(),
})

const schema = z.object({
  company_id: z.string().min(1, 'Selecciona una empresa'),
  contract_id: z.string().min(1, 'Selecciona un contrato'),
  name: z.string().min(1, 'Requerido'),
  start_date: z.string().min(1, 'Requerido'),
  end_date: z.string().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
  notes: z.string().optional(),
  rules: z.array(ruleSchema).default([]),
})

type FormValues = z.infer<typeof schema>

export function ProgramFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const { data: programData } = useProgram(id ?? '')
  const createMutation = useCreateProgram()
  const updateMutation = useUpdateProgram(id ?? '')

  const { data: companiesData } = useCompanies({ limit: 200 } as Parameters<typeof useCompanies>[0])
  const companies = companiesData?.data ?? []
  const { data: serviceTypesData } = useServiceTypes()
  const serviceTypes = serviceTypesData ?? []

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_id: '',
      contract_id: '',
      name: '',
      start_date: '',
      status: 'draft',
      rules: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'rules' })

  const watchedCompanyId = watch('company_id')
  const { data: contractsData } = useContracts(
    watchedCompanyId ? { company_id: watchedCompanyId, limit: 50 } : undefined,
  )
  const contracts = contractsData?.data ?? []

  useEffect(() => {
    if (!isEdit) setValue('contract_id', '')
  }, [watchedCompanyId, setValue, isEdit])

  useEffect(() => {
    if (programData && isEdit) {
      const program = programData.program
      reset({
        company_id: program.company_id,
        contract_id: program.contract_id,
        name: program.name,
        start_date: program.start_date?.slice(0, 10) ?? '',
        end_date: program.end_date?.slice(0, 10) ?? '',
        status: program.status,
        notes: program.notes ?? '',
        rules: (programData.rules ?? []).map((r) => ({
          weekday: r.weekday,
          start_time: r.start_time.slice(0, 5),
          duration_minutes: r.duration_minutes,
          frequency_interval_weeks: r.frequency_interval_weeks,
          max_occurrences: r.max_occurrences,
          service_type_id: r.service_type_id ?? '',
        })),
      })
    }
  }, [programData, reset, isEdit])

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        company_id: values.company_id,
        contract_id: values.contract_id,
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date || undefined,
        status: values.status,
        notes: values.notes || undefined,
        rules: values.rules.map((r) => ({
          weekday: r.weekday,
          start_time: r.start_time,
          duration_minutes: r.duration_minutes,
          frequency_interval_weeks: r.frequency_interval_weeks,
          max_occurrences: r.max_occurrences || undefined,
          service_type_id: r.service_type_id || undefined,
        })),
      }
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        toast.success('Programa actualizado')
      } else {
        const created = await createMutation.mutateAsync(payload)
        toast.success('Programa creado')
        navigate(`/programs/${created.id}`)
        return
      }
      navigate(`/programs/${id}`)
    } catch {
      toast.error('Error al guardar el programa')
    }
  }

  function addRule() {
    append({
      weekday: 1,
      start_time: '08:00',
      duration_minutes: 60,
      frequency_interval_weeks: 1,
      max_occurrences: undefined,
      service_type_id: '',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={isEdit ? 'Editar programa' : 'Nuevo programa'} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del programa</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Empresa *</Label>
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona empresa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.fantasy_name ? `${c.fantasy_name} (${c.name})` : c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.company_id && <p className="text-xs text-destructive">{errors.company_id.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Contrato *</Label>
              <Controller
                control={control}
                name="contract_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit || !watchedCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona contrato..." />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.contract_id && <p className="text-xs text-destructive">{errors.contract_id.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Nombre del programa *</Label>
              <Input {...register('name')} placeholder="Ej: Programa kinesiología enero" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Fecha de inicio *</Label>
              <Input type="date" {...register('start_date')} />
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Fecha de fin</Label>
              <Input type="date" {...register('end_date')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Estado</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Notas</Label>
              <Textarea {...register('notes')} rows={3} placeholder="Notas o indicaciones generales..." />
            </div>
          </CardContent>
        </Card>

        {/* Schedule Rules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Reglas de agenda</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRule}>
              <Plus className="h-4 w-4 mr-1" /> Agregar regla
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin reglas. Agrega al menos una para generar agendas.
              </p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Regla {index + 1}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Día de semana</Label>
                    <Controller
                      control={control}
                      name={`rules.${index}.weekday`}
                      render={({ field: f }) => (
                        <Select onValueChange={(v) => f.onChange(Number(v))} value={String(f.value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WEEKDAY_LABELS.map((label, i) => (
                              <SelectItem key={i} value={String(i)}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Hora inicio</Label>
                    <Input type="time" {...register(`rules.${index}.start_time`)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Duración (min)</Label>
                    <Input type="number" min={1} {...register(`rules.${index}.duration_minutes`)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Frecuencia (semanas)</Label>
                    <Input type="number" min={1} {...register(`rules.${index}.frequency_interval_weeks`)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Máx. ocurrencias</Label>
                    <Input type="number" min={1} {...register(`rules.${index}.max_occurrences`)} placeholder="∞" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs">Tipo de servicio</Label>
                    <Controller
                      control={control}
                      name={`rules.${index}.service_type_id`}
                      render={({ field: f }) => (
                        <Select
                          value={f.value || 'none'}
                          onValueChange={(v) => f.onChange(v === 'none' ? '' : v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Ninguno" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Ninguno</SelectItem>
                            {serviceTypes.map((st) => (
                              <SelectItem key={st.id} value={st.id}>
                                {st.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear programa'}
          </Button>
        </div>
      </form>
    </div>
  )
}
