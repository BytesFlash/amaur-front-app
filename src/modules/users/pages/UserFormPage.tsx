import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { useUser, useCreateUser, useUpdateUser, useRoles } from '../hooks/useUsers'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { usePatients } from '@/modules/patients/hooks/usePatients'
import { extractApiErrorMessage } from '@/shared/utils/apiError'
import { toast } from 'sonner'

const createSchema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  first_name: z.string().min(1, 'Requerido'),
  last_name: z.string().min(1, 'Requerido'),
  rut: z.string().optional(),
  phone: z.string().optional(),
  role_title: z.string().optional(),
  specialty: z.string().optional(),
  availability_notes: z.string().optional(),
  company_id: z.string().optional(),
  patient_id: z.string().optional(),
  role_ids: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
})

const editSchema = z.object({
  first_name: z.string().min(1, 'Requerido'),
  last_name: z.string().min(1, 'Requerido'),
  is_active: z.boolean(),
})

type CreateValues = z.infer<typeof createSchema>
type EditValues = z.infer<typeof editSchema>

export function UserFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id

  const { data: user } = useUser(id ?? '')
  const { data: roles = [] } = useRoles()
  const { data: companiesRes } = useCompanies({ limit: 200 })
  const { data: patientsRes } = usePatients({ limit: 300 })
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser(id ?? '')
  const companies = companiesRes?.data ?? []
  const patients = patientsRes?.data ?? []

  // Create form
  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { role_ids: [] },
  })

  // Edit form
  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { is_active: true },
  })

  useEffect(() => {
    if (user && isEdit) {
      editForm.reset({ first_name: user.first_name, last_name: user.last_name, is_active: user.is_active })
    }
  }, [user, isEdit, editForm])

  async function onCreateSubmit(values: CreateValues) {
    const selectedRoleNames = roles
      .filter((r) => values.role_ids.includes(r.id))
      .map((r) => r.name)
    const isProfessional = selectedRoleNames.includes('professional')
    const needsCompanyScope = selectedRoleNames.includes('company_hr') || selectedRoleNames.includes('company_worker')
    const needsPatientScope = selectedRoleNames.includes('patient')

    if (needsCompanyScope && !values.company_id) {
      toast.error('Debes seleccionar una empresa para este rol')
      return
    }
    if (needsPatientScope && !values.patient_id) {
      toast.error('Debes seleccionar un paciente para el rol patient')
      return
    }

    try {
      await createMutation.mutateAsync({
        ...values,
        rut: isProfessional ? values.rut || undefined : undefined,
        phone: isProfessional ? values.phone || undefined : undefined,
        role_title: isProfessional ? values.role_title || undefined : undefined,
        specialty: isProfessional ? values.specialty || undefined : undefined,
        availability_notes: isProfessional ? values.availability_notes || undefined : undefined,
        company_id: values.company_id || undefined,
        patient_id: values.patient_id || undefined,
      })
      toast.success('Usuario creado')
      navigate('/users')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al crear el usuario'))
    }
  }

  async function onEditSubmit(values: EditValues) {
    try {
      await updateMutation.mutateAsync(values)
      toast.success('Usuario actualizado')
      navigate('/users')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al actualizar el usuario'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={isEdit ? 'Editar usuario' : 'Nuevo usuario'} />
      </div>

      {!isEdit ? (
        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6" noValidate>
          <Card>
            <CardHeader><CardTitle className="text-base">Datos del usuario</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre *" error={createForm.formState.errors.first_name?.message}>
                <Input {...createForm.register('first_name')} />
              </Field>
              <Field label="Apellido *" error={createForm.formState.errors.last_name?.message}>
                <Input {...createForm.register('last_name')} />
              </Field>
              <Field label="Correo *" error={createForm.formState.errors.email?.message} className="sm:col-span-2">
                <Input type="email" {...createForm.register('email')} />
              </Field>
              <Field label="Contraseña *" error={createForm.formState.errors.password?.message} className="sm:col-span-2">
                <Input type="password" {...createForm.register('password')} />
              </Field>
              <Field label="Roles *" error={createForm.formState.errors.role_ids?.message} className="sm:col-span-2">
                <Controller
                  control={createForm.control}
                  name="role_ids"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {roles.map((r) => {
                        const selected = field.value.includes(r.id)
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => field.onChange(
                              selected ? field.value.filter((v) => v !== r.id) : [...field.value, r.id]
                            )}
                            className={`rounded-full border px-3 py-1 text-sm transition-colors ${selected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                          >
                            {r.name}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </Field>

              <Controller
                control={createForm.control}
                name="role_ids"
                render={({ field }) => {
                  const selectedRoleNames = roles
                    .filter((r) => field.value.includes(r.id))
                    .map((r) => r.name)
                  const isProfessional = selectedRoleNames.includes('professional')
                  const needsCompanyScope = selectedRoleNames.includes('company_hr') || selectedRoleNames.includes('company_worker')
                  const needsPatientScope = selectedRoleNames.includes('patient')

                  return (
                    <>
                      {needsCompanyScope && (
                        <Field label="Empresa (scope) *" className="sm:col-span-2">
                          <Controller
                            control={createForm.control}
                            name="company_id"
                            render={({ field: companyField }) => (
                              <Select value={companyField.value ?? ''} onValueChange={companyField.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar empresa" />
                                </SelectTrigger>
                                <SelectContent>
                                  {companies.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.fantasy_name ?? c.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>
                      )}

                      {needsPatientScope && (
                      <Field label="Paciente asociado (scope) *" className="sm:col-span-2">
                          <Controller
                            control={createForm.control}
                            name="patient_id"
                            render={({ field: patientField }) => (
                              <Select value={patientField.value ?? ''} onValueChange={patientField.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar paciente" />
                                </SelectTrigger>
                                <SelectContent>
                                  {patients.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </Field>
                      )}

            {isProfessional && (
            <>
              <Field label="RUT profesional" className="sm:col-span-2">
              <Input {...createForm.register('rut')} placeholder="12.345.678-9" />
              </Field>
              <Field label="Teléfono profesional" className="sm:col-span-2">
              <Input {...createForm.register('phone')} />
              </Field>
              <Field label="Cargo profesional" className="sm:col-span-2">
              <Input {...createForm.register('role_title')} placeholder="Ej: Psicólogo clínico" />
              </Field>
              <Field label="Especialidad" className="sm:col-span-2">
              <Input {...createForm.register('specialty')} placeholder="Ej: Salud ocupacional" />
              </Field>
              <Field label="Notas de disponibilidad" className="sm:col-span-2">
              <Input {...createForm.register('availability_notes')} />
              </Field>
            </>
            )}
                    </>
                  )
                }}
              />
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" disabled={createForm.formState.isSubmitting}>
              {createForm.formState.isSubmitting ? 'Creando…' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6" noValidate>
          <Card>
            <CardHeader><CardTitle className="text-base">Datos del usuario</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre *" error={editForm.formState.errors.first_name?.message}>
                <Input {...editForm.register('first_name')} />
              </Field>
              <Field label="Apellido *" error={editForm.formState.errors.last_name?.message}>
                <Input {...editForm.register('last_name')} />
              </Field>
              <Field label="Estado" className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...editForm.register('is_active')} className="h-4 w-4" />
                  Usuario activo
                </label>
              </Field>
            </CardContent>
          </Card>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" disabled={editForm.formState.isSubmitting}>
              {editForm.formState.isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      )}
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
