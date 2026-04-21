import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
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
import { useContract, useContractServices, useCreateContract, useUpdateContract } from '../hooks/useContracts'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { extractApiErrorMessage } from '@/shared/utils/apiError'
import { toast } from 'sonner'

const optionalNumber = z.preprocess((value) => {
  if (value === '' || value == null) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? value : parsed
}, z.number().optional())

const optionalString = z.preprocess((value) => {
  if (value === '') return undefined
  return value
}, z.string().optional())

const serviceSchema = z.object({
  id: z.string().optional(),
  service_type_id: z.string().min(1, 'Selecciona un servicio'),
  quota_type: z.enum(['sessions', 'hours', 'unlimited']).default('sessions'),
  quantity_per_period: optionalNumber,
  period_unit: z.enum(['month', 'week', 'total']).optional(),
  sessions_included: optionalNumber,
  hours_included: optionalNumber,
  price_per_unit: optionalNumber,
  notes: optionalString,
}).superRefine((value, ctx) => {
  if (value.quota_type === 'sessions' && value.sessions_included == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sessions_included'],
      message: 'Debes indicar las sesiones incluidas',
    })
  }
  if (value.quota_type === 'hours' && value.hours_included == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['hours_included'],
      message: 'Debes indicar las horas incluidas',
    })
  }
})

const schema = z.object({
  company_id: z.string().min(1, 'Selecciona una empresa'),
  name: z.string().min(1, 'Requerido'),
  contract_type: z.enum(['mensual', 'anual', 'paquete', 'puntual']).optional(),
  status: z.enum(['draft', 'active', 'paused', 'expired', 'terminated']).default('draft'),
  start_date: z.string().min(1, 'Requerido'),
  end_date: z.string().optional(),
  renewal_date: z.string().optional(),
  value_clp: optionalNumber,
  billing_cycle: z.string().optional(),
  notes: z.string().optional(),
  services: z.array(serviceSchema).default([]),
})

type FormValues = z.infer<typeof schema>

const QUOTA_LABELS: Record<'sessions' | 'hours' | 'unlimited', string> = {
  sessions: 'Sesiones',
  hours: 'Horas',
  unlimited: 'Ilimitado',
}

export function ContractFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const { data: contract } = useContract(id ?? '')
  const { data: contractServices = [], isLoading: servicesLoading } = useContractServices(id ?? '')
  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract(id ?? '')
  const { data: companiesData } = useCompanies({ limit: 200 } as Parameters<typeof useCompanies>[0])
  const { data: serviceTypes = [] } = useServiceTypes()
  const companies = companiesData?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_id: '',
      name: '',
      status: 'draft',
      start_date: '',
      services: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'services' })
  const services = watch('services')

  useEffect(() => {
    if (!contract) return
    reset({
      company_id: contract.company_id,
      name: contract.name,
      contract_type: contract.contract_type,
      status: contract.status,
      start_date: contract.start_date.slice(0, 10),
      end_date: contract.end_date?.slice(0, 10) ?? '',
      renewal_date: contract.renewal_date?.slice(0, 10) ?? '',
      value_clp: contract.value_clp ?? undefined,
      billing_cycle: contract.billing_cycle ?? '',
      notes: contract.notes ?? '',
      services: contractServices.map((service) => ({
        id: service.id,
        service_type_id: service.service_type_id,
        quota_type: service.quota_type,
        quantity_per_period: service.quantity_per_period ?? undefined,
        period_unit: service.period_unit ?? undefined,
        sessions_included: service.sessions_included ?? undefined,
        hours_included: service.hours_included ?? undefined,
        price_per_unit: service.price_per_unit ?? undefined,
        notes: service.notes ?? '',
      })),
    })
  }, [contract, contractServices, reset])

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      end_date: values.end_date || undefined,
      renewal_date: values.renewal_date || undefined,
      billing_cycle: values.billing_cycle || undefined,
      notes: values.notes || undefined,
      services: values.services.map((service) => ({
        ...service,
        id: service.id || undefined,
        period_unit: service.period_unit || undefined,
        notes: service.notes || undefined,
      })),
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        toast.success('Contrato actualizado')
      } else {
        await createMutation.mutateAsync(payload as Parameters<typeof createMutation.mutateAsync>[0])
        toast.success('Contrato creado')
      }
      navigate('/contracts')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al guardar el contrato'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={isEdit ? 'Editar contrato' : 'Nuevo contrato'} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del contrato</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Empresa *" error={errors.company_id?.message} className="sm:col-span-2">
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona empresa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.fantasy_name ? `${company.fantasy_name} (${company.name})` : company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Nombre del contrato *" error={errors.name?.message} className="sm:col-span-2">
              <Input placeholder="Ej: Contrato bienestar mensual" {...register('name')} />
            </Field>

            <Field label="Tipo">
              <Controller
                control={control}
                name="contract_type"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value ?? ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="paquete">Paquete</SelectItem>
                      <SelectItem value="puntual">Puntual</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Estado">
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
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="expired">Vencido</SelectItem>
                      <SelectItem value="terminated">Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            <Field label="Fecha inicio *" error={errors.start_date?.message}>
              <Input type="date" {...register('start_date')} />
            </Field>

            <Field label="Fecha termino">
              <Input type="date" {...register('end_date')} />
            </Field>

            <Field label="Fecha renovacion">
              <Input type="date" {...register('renewal_date')} />
            </Field>

            <Field label="Valor (CLP)">
              <Input type="number" placeholder="0" {...register('value_clp')} />
            </Field>

            <Field label="Ciclo de facturacion">
              <Input placeholder="Ej: Mensual, Trimestral..." {...register('billing_cycle')} />
            </Field>

            <Field label="Notas" className="sm:col-span-2">
              <Textarea rows={3} {...register('notes')} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base">Servicios asociados</CardTitle>
              <p className="text-sm text-muted-foreground">
                Agrega los servicios que cubre el contrato y su modalidad de cupo.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  service_type_id: '',
                  quota_type: 'sessions',
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar servicio
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {servicesLoading && isEdit ? (
              <p className="text-sm text-muted-foreground">Cargando servicios asociados...</p>
            ) : fields.length === 0 ? (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                Este contrato aún no tiene servicios asociados.
              </div>
            ) : (
              fields.map((field, index) => {
                const quotaType = services?.[index]?.quota_type ?? 'sessions'
                return (
                  <div key={field.id} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">Servicio {index + 1}</p>
                        <p className="text-xs text-muted-foreground">{QUOTA_LABELS[quotaType]}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Tipo de servicio *" error={errors.services?.[index]?.service_type_id?.message}>
                        <Controller
                          control={control}
                          name={`services.${index}.service_type_id`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona servicio..." />
                              </SelectTrigger>
                              <SelectContent>
                                {serviceTypes.map((serviceType) => (
                                  <SelectItem key={serviceType.id} value={serviceType.id}>
                                    {serviceType.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>

                      <Field label="Tipo de cupo">
                        <Controller
                          control={control}
                          name={`services.${index}.quota_type`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sessions">Sesiones</SelectItem>
                                <SelectItem value="hours">Horas</SelectItem>
                                <SelectItem value="unlimited">Ilimitado</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>

                      <Field label="Cantidad por periodo">
                        <Input type="number" min="0" {...register(`services.${index}.quantity_per_period`)} />
                      </Field>

                      <Field label="Periodo">
                        <Controller
                          control={control}
                          name={`services.${index}.period_unit`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="month">Mensual</SelectItem>
                                <SelectItem value="week">Semanal</SelectItem>
                                <SelectItem value="total">Total contrato</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </Field>

                      {quotaType === 'sessions' && (
                        <Field label="Sesiones incluidas *" error={errors.services?.[index]?.sessions_included?.message}>
                          <Input type="number" min="0" {...register(`services.${index}.sessions_included`)} />
                        </Field>
                      )}

                      {quotaType === 'hours' && (
                        <Field label="Horas incluidas *" error={errors.services?.[index]?.hours_included?.message}>
                          <Input type="number" min="0" step="0.5" {...register(`services.${index}.hours_included`)} />
                        </Field>
                      )}

                      <Field label="Precio por unidad">
                        <Input type="number" min="0" step="0.01" {...register(`services.${index}.price_per_unit`)} />
                      </Field>

                      <Field label="Notas" className="sm:col-span-2">
                        <Textarea rows={2} {...register(`services.${index}.notes`)} />
                      </Field>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear contrato'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancelar
          </Button>
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
