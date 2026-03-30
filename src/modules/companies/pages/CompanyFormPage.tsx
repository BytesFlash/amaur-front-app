import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'
import { useCompany, useCreateCompany, useUpdateCompany } from '../hooks/useCompanies'
import type { CreateCompanyInput } from '../api/companiesApi'
import type { Company } from '@/types/company'
import { extractApiErrorMessage } from '@/shared/utils/apiError'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(1, 'Requerido'),
  fantasy_name: z.string().optional(),
  rut: z.string().optional(),
  industry: z.string().optional(),
  size_category: z.enum(['micro', 'pequeña', 'mediana', 'grande']).optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  billing_email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  website: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect', 'churned']),
  admin_email: z.string().email('Email invalido').optional().or(z.literal('')),
  admin_password: z.string().optional(),
  admin_first_name: z.string().optional(),
  admin_last_name: z.string().optional(),
  commercial_notes: z.string().optional(),
  lead_source: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export function CompanyFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const { data: company } = useCompany(id ?? '')
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany(id ?? '')

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', status: 'prospect' },
  })

  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        fantasy_name: company.fantasy_name ?? '',
        rut: company.rut ?? '',
        industry: company.industry ?? '',
        size_category: company.size_category,
        contact_name: company.contact_name ?? '',
        contact_email: company.contact_email ?? '',
        contact_phone: company.contact_phone ?? '',
        billing_email: company.billing_email ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        region: company.region ?? '',
        website: company.website ?? '',
        status: company.status,
        admin_email: '',
        admin_password: '',
        admin_first_name: '',
        admin_last_name: '',
        commercial_notes: company.commercial_notes ?? '',
        lead_source: company.lead_source ?? '',
      })
    }
  }, [company, form])

  async function onSubmit(values: FormValues) {
    if (!isEdit) {
      if (!values.admin_email) {
        toast.error('Debes ingresar el email del administrador de la empresa')
        return
      }
      if (!values.admin_password) {
        toast.error('Debes ingresar la clave inicial del administrador')
        return
      }
    }
    const basePayload: Partial<Company> = {
      name: values.name,
      fantasy_name: values.fantasy_name || undefined,
      rut: values.rut || undefined,
      industry: values.industry || undefined,
      size_category: values.size_category,
      contact_name: values.contact_name || undefined,
      contact_email: values.contact_email || undefined,
      contact_phone: values.contact_phone || undefined,
      billing_email: values.billing_email || undefined,
      address: values.address || undefined,
      city: values.city || undefined,
      region: values.region || undefined,
      website: values.website || undefined,
      status: values.status,
      commercial_notes: values.commercial_notes || undefined,
      lead_source: values.lead_source || undefined,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(basePayload)
        toast.success('Empresa actualizada')
      } else {
        const createPayload: CreateCompanyInput = {
          ...basePayload,
          admin_email: values.admin_email || '',
          admin_password: values.admin_password || '',
          admin_first_name: values.admin_first_name || undefined,
          admin_last_name: values.admin_last_name || undefined,
        }
        await createMutation.mutateAsync(createPayload)
        toast.success('Empresa creada')
      }
      navigate('/companies')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al guardar la empresa'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={isEdit ? 'Editar empresa' : 'Nueva empresa'} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Datos de la empresa</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Razón social *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fantasy_name" render={({ field }) => (
                <FormItem><FormLabel>Nombre de fantasía</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="rut" render={({ field }) => (
                <FormItem><FormLabel>RUT</FormLabel><FormControl><Input placeholder="12.345.678-9" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="industry" render={({ field }) => (
                <FormItem><FormLabel>Industria</FormLabel><FormControl><Input placeholder="Ej: Construcción" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="size_category" render={({ field }) => (
                <FormItem><FormLabel>Tamaño</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="micro">Micro</SelectItem>
                      <SelectItem value="pequeña">Pequeña</SelectItem>
                      <SelectItem value="mediana">Mediana</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="prospect">Prospecto</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                      <SelectItem value="churned">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          {!isEdit && (
            <Card>
              <CardHeader><CardTitle>Acceso de empresa</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="admin_email" render={({ field }) => (
                  <FormItem><FormLabel>Email administrador *</FormLabel><FormControl><Input type="email" placeholder="admin@empresa.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="admin_password" render={({ field }) => (
                  <FormItem><FormLabel>Clave inicial *</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="admin_first_name" render={({ field }) => (
                  <FormItem><FormLabel>Nombre administrador</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="admin_last_name" render={({ field }) => (
                  <FormItem><FormLabel>Apellido administrador</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Contacto y ubicación</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="contact_name" render={({ field }) => (
                <FormItem><FormLabel>Nombre de contacto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contact_phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="contact_email" render={({ field }) => (
                <FormItem><FormLabel>Email de contacto</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="billing_email" render={({ field }) => (
                <FormItem><FormLabel>Email de facturación</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem><FormLabel>Ciudad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="region" render={({ field }) => (
                <FormItem><FormLabel>Región</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem><FormLabel>Sitio web</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Notas comerciales</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="lead_source" render={({ field }) => (
                <FormItem><FormLabel>Origen del lead</FormLabel><FormControl><Input placeholder="Ej: Referido" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="commercial_notes" render={({ field }) => (
                <FormItem className="sm:col-span-1"><FormLabel>Notas</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Guardar cambios' : 'Crear empresa'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

