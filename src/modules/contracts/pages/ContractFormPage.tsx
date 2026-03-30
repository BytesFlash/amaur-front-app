import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useContract, useCreateContract, useUpdateContract } from '../hooks/useContracts'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { toast } from 'sonner'

const schema = z.object({
  company_id: z.string().min(1, 'Selecciona una empresa'),
  name: z.string().min(1, 'Requerido'),
  contract_type: z.enum(['mensual', 'anual', 'paquete', 'puntual']).optional(),
  status: z.enum(['draft', 'active', 'paused', 'expired', 'terminated']).default('draft'),
  start_date: z.string().min(1, 'Requerido'),
  end_date: z.string().optional(),
  renewal_date: z.string().optional(),
  value_clp: z.coerce.number().optional(),
  billing_cycle: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function ContractFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const { data: contract } = useContract(id ?? '')
  const createMutation = useCreateContract()
  const updateMutation = useUpdateContract(id ?? '')
  const { data: companiesData } = useCompanies({ limit: 200 } as Parameters<typeof useCompanies>[0])
  const companies = companiesData?.data ?? []

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { company_id: '', name: '', status: 'draft', start_date: '' },
  })

  useEffect(() => {
    if (contract) {
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
      })
    }
  }, [contract, reset])

  async function onSubmit(values: FormValues) {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(values)
        toast.success('Contrato actualizado')
      } else {
        await createMutation.mutateAsync(values as Parameters<typeof createMutation.mutateAsync>[0])
        toast.success('Contrato creado')
      }
      navigate('/contracts')
    } catch {
      toast.error('Error al guardar el contrato')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={isEdit ? 'Editar contrato' : 'Nuevo contrato'} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader><CardTitle className="text-base">Datos del contrato</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <Field label="Empresa *" error={errors.company_id?.message} className="sm:col-span-2">
              <Controller control={control} name="company_id" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                  <SelectTrigger><SelectValue placeholder="Selecciona empresa..." /></SelectTrigger>
                  <SelectContent>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.fantasy_name ? `${c.fantasy_name} (${c.name})` : c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )} />
            </Field>

            <Field label="Nombre del contrato *" error={errors.name?.message} className="sm:col-span-2">
              <Input placeholder="Ej: Contrato bienestar mensual" {...register('name')} />
            </Field>

            <Field label="Tipo">
              <Controller control={control} name="contract_type" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="paquete">Paquete</SelectItem>
                    <SelectItem value="puntual">Puntual</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </Field>

            <Field label="Estado">
              <Controller control={control} name="status" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="paused">Pausado</SelectItem>
                    <SelectItem value="expired">Vencido</SelectItem>
                    <SelectItem value="terminated">Terminado</SelectItem>
                  </SelectContent>
                </Select>
              )} />
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

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Guardar cambios' : 'Crear contrato'}</Button>
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
