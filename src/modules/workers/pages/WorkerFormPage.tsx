import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { useWorker, useCreateWorker, useUpdateWorker, useWorkerAvailability, useSetWorkerAvailability } from '../hooks/useWorkers'
import { type AvailabilityRuleInput } from '../api/workersApi'
import { useSpecialties } from '@/shared/hooks/useSpecialties'
import { extractApiErrorMessage } from '@/shared/utils/apiError'
import { toast } from 'sonner'

const schema = z.object({
  login_email: z.string().email('Email invalido').optional().or(z.literal('')),
  login_password: z.string().optional(),
  first_name: z.string().min(1, 'Requerido'),
  last_name: z.string().min(1, 'Requerido'),
  rut: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  role_title: z.string().optional(),
  hire_date: z.string().optional(),
  birth_date: z.string().optional(),
  availability_notes: z.string().optional(),
  is_active: z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const WEEKDAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export function WorkerFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id

  const { data: worker } = useWorker(id ?? '')
  const { data: catalog = [] } = useSpecialties()
  const { data: savedRules = [] } = useWorkerAvailability(id ?? '')
  const createMutation = useCreateWorker()
  const updateMutation = useUpdateWorker(id ?? '')
  const setAvailMutation = useSetWorkerAvailability(id ?? '')

  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [availRules, setAvailRules] = useState<AvailabilityRuleInput[]>([])

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { first_name: '', last_name: '', is_active: true } })

  useEffect(() => {
    if (savedRules.length > 0) {
      setAvailRules(savedRules.map((r) => ({ weekday: r.weekday, start_time: r.start_time, end_time: r.end_time })))
    }
  }, [savedRules])

  useEffect(() => {
    if (worker) {
      form.reset({
        login_email: '',
        login_password: '',
        first_name: worker.first_name,
        last_name: worker.last_name,
        rut: worker.rut ?? '',
        email: worker.email ?? '',
        phone: worker.phone ?? '',
        role_title: worker.role_title ?? '',
        hire_date: worker.hire_date ? worker.hire_date.slice(0, 10) : '',
        birth_date: worker.birth_date ? worker.birth_date.slice(0, 10) : '',
        availability_notes: worker.availability_notes ?? '',
        is_active: worker.is_active,
      })
      // Initialise selected codes from the worker's specialties array
      if (worker.specialties && worker.specialties.length > 0) {
        setSelectedCodes(worker.specialties.map((s) => s.code))
      }
    }
  }, [worker, form])

  function toggleCode(code: string) {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  async function onSubmit(values: FormValues) {
    if (!isEdit && !values.login_email) {
      toast.error('Debes ingresar el email de acceso del profesional')
      return
    }
    if (!isEdit && !values.login_password) {
      toast.error('Debes ingresar la clave inicial del profesional')
      return
    }
    const payload = {
      ...values,
      email: values.email || undefined,
      hire_date: values.hire_date || undefined,
      birth_date: values.birth_date || undefined,
      specialty_codes: selectedCodes,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        // Save availability rules too
        await setAvailMutation.mutateAsync(availRules)
        toast.success('Profesional actualizado')
      } else {
        await createMutation.mutateAsync(payload as Parameters<typeof createMutation.mutateAsync>[0])
        toast.success('Profesional creado')
      }
      navigate('/workers')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al guardar el profesional'))
    }
  }

  function addRule() {
    setAvailRules((prev) => [...prev, { weekday: 1, start_time: '09:00', end_time: '18:00' }])
  }

  function removeRule(i: number) {
    setAvailRules((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateRule(i: number, field: keyof AvailabilityRuleInput, value: string | number) {
    setAvailRules((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={isEdit ? 'Editar profesional' : 'Nuevo profesional'} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Información personal</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!isEdit && (
                <>
                <FormField control={form.control} name="login_email" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Email de acceso *</FormLabel>
                    <FormControl><Input type="email" placeholder="profesional@amaur.cl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="login_password" render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Clave inicial *</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                </>
              )}
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="rut" render={({ field }) => (
                <FormItem><FormLabel>RUT</FormLabel><FormControl><Input placeholder="12.345.678-9" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="hire_date" render={({ field }) => (
                <FormItem><FormLabel>Fecha de ingreso</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="birth_date" render={({ field }) => (
                <FormItem><FormLabel>Fecha de nacimiento *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Rol y especialidades</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="role_title" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Cargo</FormLabel>
                  <FormControl><Input placeholder="Ej: Profesional de salud" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="sm:col-span-2 space-y-2">
                <Label>Especialidades</Label>
                {catalog.length === 0 && (
                  <p className="text-sm text-muted-foreground">Cargando catálogo…</p>
                )}
                <div className="grid grid-cols-1 gap-2 rounded-md border p-3 sm:grid-cols-2">
                  {catalog.map((sp) => (
                    <label key={sp.code} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedCodes.includes(sp.code)}
                        onCheckedChange={() => toggleCode(sp.code)}
                      />
                      <span>{sp.name}</span>
                    </label>
                  ))}
                </div>
                {selectedCodes.length === 0 && (
                  <p className="text-xs text-muted-foreground">Selecciona al menos una especialidad.</p>
                )}
              </div>

              <FormField control={form.control} name="availability_notes" render={({ field }) => (
                <FormItem className="sm:col-span-2"><FormLabel>Notas de disponibilidad</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Horario de atención</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addRule}>
                <Plus className="h-4 w-4 mr-1" /> Agregar bloque
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {availRules.length === 0 && (
                <p className="text-sm text-muted-foreground">Sin bloques de disponibilidad. Agrega los días y horarios de atención.</p>
              )}
              {availRules.map((rule, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap border rounded-md p-3">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Día</Label>
                    <Select value={String(rule.weekday)} onValueChange={(v) => updateRule(i, 'weekday', Number(v))}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {WEEKDAY_LABELS.map((label, d) => (
                          <SelectItem key={d} value={String(d)}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Desde</Label>
                    <Input type="time" value={rule.start_time} onChange={(e) => updateRule(i, 'start_time', e.target.value)} className="w-28" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Hasta</Label>
                    <Input type="time" value={rule.end_time} onChange={(e) => updateRule(i, 'end_time', e.target.value)} className="w-28" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="mt-4" onClick={() => removeRule(i)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {isEdit && (
            <Card>
              <CardContent className="pt-6">
                <FormField control={form.control} name="is_active" render={({ field }) => (
                  <FormItem className="flex items-center gap-3">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="!mt-0">Profesional activo</FormLabel>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEdit ? 'Guardar cambios' : 'Crear profesional'}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

