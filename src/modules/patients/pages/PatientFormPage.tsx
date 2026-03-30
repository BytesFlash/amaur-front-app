import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Trash2, UserCheck, LogIn } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  usePatient,
  useCreatePatient,
  useUpdatePatient,
  usePatientLoginInfo,
  useTutorSearch,
  useEnableLogin,
  useDisableLogin,
} from '../hooks/usePatients'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { extractApiErrorMessage } from '@/shared/utils/apiError'
import { toast } from 'sonner'

const schema = z.object({
  rut: z.string().min(7, 'RUT invalido').max(12).optional().or(z.literal('')),
  first_name: z.string().min(1, 'Requerido'),
  last_name: z.string().min(1, 'Requerido'),
  birth_date: z.string().optional(),
  gender: z.enum(['masculino', 'femenino', 'otro', 'prefiero_no_decir']).optional(),
  email: z.string().email('Correo invalido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  general_notes: z.string().optional(),
  patient_type: z.enum(['particular', 'company', 'both']).default('particular'),
  tutor_id: z.string().uuid().optional().or(z.literal('')),
  companies: z.array(z.object({
    company_id: z.string().min(1, 'Selecciona empresa'),
    position: z.string().optional(),
    department: z.string().optional(),
    start_date: z.string().optional(),
  })).optional(),
})
type FormValues = z.infer<typeof schema>

function isMinorFromDate(birthDate?: string): boolean {
  if (!birthDate) return false
  const today = new Date()
  const dob = new Date(birthDate)
  const age = today.getFullYear() - dob.getFullYear() -
    (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)
  return age < 18
}

export function PatientFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id

  const { data: patient } = usePatient(id ?? '')
  const { data: loginInfo } = usePatientLoginInfo(id ?? '', isEdit)
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient(id ?? '')
  const enableLoginMutation = useEnableLogin(id ?? '')
  const disableLoginMutation = useDisableLogin(id ?? '')

  const { data: companiesData } = useCompanies({ limit: 200 } as Parameters<typeof useCompanies>[0])
  const companies = companiesData?.data ?? []

  const [tutorSearch, setTutorSearch] = useState('')
  const { data: tutorResults = [] } = useTutorSearch(tutorSearch)
  const [showTutorDropdown, setShowTutorDropdown] = useState(false)
  const [selectedTutorName, setSelectedTutorName] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginConfirm, setLoginConfirm] = useState('')

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { patient_type: 'particular', companies: [] } })

  const { fields, append, remove } = useFieldArray({ control, name: 'companies' })
  const patientType = watch('patient_type')
  const birthDate = watch('birth_date')
  const isMinor = isMinorFromDate(birthDate)

  useEffect(() => {
    if (patient && isEdit) {
      reset({
        rut: patient.rut ?? '',
        first_name: patient.first_name,
        last_name: patient.last_name,
        birth_date: patient.birth_date?.slice(0, 10) ?? '',
        gender: patient.gender as FormValues['gender'],
        email: patient.email ?? '',
        phone: patient.phone ?? '',
        address: patient.address ?? '',
        city: patient.city ?? '',
        region: patient.region ?? '',
        emergency_contact_name: patient.emergency_contact_name ?? '',
        emergency_contact_phone: patient.emergency_contact_phone ?? '',
        general_notes: patient.general_notes ?? '',
        patient_type: patient.patient_type as FormValues['patient_type'],
        tutor_id: patient.tutor_id ?? '',
        companies: patient.companies?.map((c) => ({
          company_id: c.company_id,
          position: c.position ?? '',
          department: c.department ?? '',
          start_date: c.start_date?.slice(0, 10) ?? '',
        })) ?? [],
      })
      if (patient.tutor) {
        setSelectedTutorName(`${patient.tutor.first_name} ${patient.tutor.last_name}`)
      }
    }
  }, [patient, isEdit, reset])

  async function onSubmit(values: FormValues) {
    const payload = {
      ...values,
      rut: values.rut || undefined,
      email: values.email || undefined,
      tutor_id: values.tutor_id || undefined,
      companies: (patientType !== 'particular') ? values.companies : undefined,
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        toast.success('Paciente actualizado')
        navigate(-1)
      } else {
        const created = await createMutation.mutateAsync(payload as Parameters<typeof createMutation.mutateAsync>[0])
        toast.success('Paciente creado')
        navigate(`/patients/${created.id}`)
      }
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al guardar el paciente'))
    }
  }

  async function handleEnableLogin() {
    if (!loginPassword) { toast.error('La contrasena es requerida'); return }
    if (loginPassword !== loginConfirm) { toast.error('Las contrasenas no coinciden'); return }
    try {
      await enableLoginMutation.mutateAsync({
        login_email: loginEmail || undefined,
        login_password: loginPassword,
      })
      toast.success('Login habilitado correctamente')
      setLoginPassword('')
      setLoginConfirm('')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al habilitar login'))
    }
  }

  async function handleDisableLogin() {
    if (!confirm('Desactivar el acceso al portal para este paciente?')) return
    try {
      await disableLoginMutation.mutateAsync()
      toast.success('Login desactivado')
    } catch (err) {
      toast.error(extractApiErrorMessage(err, 'Error al desactivar login'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader title={isEdit ? 'Editar paciente' : 'Nuevo paciente'} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* Datos personales */}
        <Card>
          <CardHeader><CardTitle className="text-base">Datos personales</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="RUT" error={errors.rut?.message}>
              <Input placeholder="12.345.678-9" {...register('rut')} />
            </Field>
            <Field label="Tipo de paciente *" error={errors.patient_type?.message}>
              <Controller control={control} name="patient_type" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="company">De empresa</SelectItem>
                    <SelectItem value="both">Ambos</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </Field>
            <Field label="Nombre *" error={errors.first_name?.message}>
              <Input placeholder="Maria" {...register('first_name')} />
            </Field>
            <Field label="Apellido *" error={errors.last_name?.message}>
              <Input placeholder="Gonzalez" {...register('last_name')} />
            </Field>
            <Field label="Fecha de nacimiento">
              <Input type="date" {...register('birth_date')} />
            </Field>
            <Field label="Genero">
              <Controller control={control} name="gender" render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ''}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="femenino">Femenino</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                    <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </Field>
            <Field label="Correo de contacto (clinico)" error={errors.email?.message}>
              <Input type="email" placeholder="correo@ejemplo.com" {...register('email')} />
            </Field>
            <Field label="Telefono">
              <Input placeholder="+56 9 1234 5678" {...register('phone')} />
            </Field>
            <Field label="Ciudad">
              <Input placeholder="Santiago" {...register('city')} />
            </Field>
            <Field label="Region">
              <Input placeholder="Metropolitana" {...register('region')} />
            </Field>
            <Field label="Direccion" className="sm:col-span-2">
              <Input placeholder="Av. Ejemplo 123" {...register('address')} />
            </Field>
            <Field label="Contacto de emergencia">
              <Input placeholder="Nombre" {...register('emergency_contact_name')} />
            </Field>
            <Field label="Telefono de emergencia">
              <Input placeholder="+56 9..." {...register('emergency_contact_phone')} />
            </Field>
            <Field label="Notas generales" className="sm:col-span-2">
              <Textarea rows={3} {...register('general_notes')} />
            </Field>
          </CardContent>
        </Card>

        {/* Tutor / Representante legal */}
        <Card className={isMinor ? 'border-amber-300' : ''}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Tutor / Representante legal
                {isMinor && <span className="ml-2 text-xs font-normal text-amber-600">(obligatorio para menor de edad)</span>}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Asigna un tutor si el paciente es menor de edad o requiere representante legal.
              El tutor debe ser un paciente adulto ya registrado.
            </p>
            <Field label="Buscar tutor por nombre o RUT">
              <div className="relative">
                <Input
                  placeholder="Escribe al menos 2 caracteres..."
                  value={selectedTutorName || tutorSearch}
                  onChange={(e) => {
                    setTutorSearch(e.target.value)
                    setSelectedTutorName('')
                    setValue('tutor_id', '')
                    setShowTutorDropdown(true)
                  }}
                  onFocus={() => setShowTutorDropdown(true)}
                  autoComplete="off"
                />
                {showTutorDropdown && tutorResults.length > 0 && !selectedTutorName && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
                    {tutorResults.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                        onClick={() => {
                          setValue('tutor_id', t.id)
                          setSelectedTutorName(`${t.first_name} ${t.last_name}${t.rut ? ` (${t.rut})` : ''}`)
                          setTutorSearch('')
                          setShowTutorDropdown(false)
                        }}
                      >
                        {t.first_name} {t.last_name}
                        {t.rut && <span className="ml-1 text-xs text-muted-foreground">{t.rut}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Field>
            {selectedTutorName && (
              <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                <span className="text-sm font-medium">{selectedTutorName}</span>
                <Button type="button" variant="ghost" size="sm" className="h-6 text-xs text-destructive"
                  onClick={() => { setValue('tutor_id', ''); setSelectedTutorName(''); setTutorSearch('') }}>
                  Quitar tutor
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empresa empleadora */}
        {patientType !== 'particular' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Empresa empleadora</CardTitle>
                <Button type="button" variant="outline" size="sm"
                  onClick={() => append({ company_id: '', position: '', department: '', start_date: '' })}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />Agregar empresa
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 && (
                <p className="text-sm text-muted-foreground">No hay empresas asociadas. Haz clic en "Agregar empresa".</p>
              )}
              {fields.map((field, idx) => (
                <div key={field.id} className="relative rounded-lg border p-4">
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7"
                    onClick={() => remove(idx)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Empresa *" error={errors.companies?.[idx]?.company_id?.message} className="sm:col-span-2">
                      <Controller control={control} name={`companies.${idx}.company_id`} render={({ field: f }) => (
                        <Select onValueChange={f.onChange} value={f.value}>
                          <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                          <SelectContent>
                            {companies.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.fantasy_name ? `${c.fantasy_name} (${c.name})` : c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )} />
                    </Field>
                    <Field label="Cargo / Posicion">
                      <Input placeholder="Ej: Operador" {...register(`companies.${idx}.position`)} />
                    </Field>
                    <Field label="Departamento">
                      <Input placeholder="Ej: Produccion" {...register(`companies.${idx}.department`)} />
                    </Field>
                    <Field label="Fecha de ingreso">
                      <Input type="date" {...register(`companies.${idx}.start_date`)} />
                    </Field>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Guardar cambios' : 'Crear paciente'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
        </div>
      </form>

      {/* Acceso al portal (solo en edicion) */}
      {isEdit && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Acceso al portal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loginInfo ? (
              <>
                <div className="rounded-md border bg-muted/40 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Email de acceso</p>
                  <p className="text-sm font-medium">{loginInfo.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Rol: {loginInfo.roles.join(', ') || 'Sin roles asignados'}
                  </p>
                  <p className={`text-xs font-medium ${loginInfo.is_active ? 'text-green-600' : 'text-red-500'}`}>
                    {loginInfo.is_active ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Cambiar contrasena</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Nueva contrasena">
                      <Input type="password" value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)} placeholder="Nueva contrasena" />
                    </Field>
                    <Field label="Confirmar contrasena">
                      <Input type="password" value={loginConfirm}
                        onChange={(e) => setLoginConfirm(e.target.value)} placeholder="Repetir contrasena" />
                    </Field>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={handleEnableLogin}
                      disabled={enableLoginMutation.isPending || !loginPassword}>
                      Actualizar contrasena
                    </Button>
                    <Button type="button" size="sm" variant="outline" className="text-destructive border-destructive/30"
                      onClick={handleDisableLogin} disabled={disableLoginMutation.isPending}>
                      Desactivar acceso
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Este paciente no tiene acceso al portal. Puedes habilitarlo aqui.
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Email de login (si se omite, usa el correo clinico)" className="sm:col-span-2">
                    <Input type="email" value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder={patient?.email ?? 'correo@ejemplo.com'} />
                  </Field>
                  <Field label="Contrasena *">
                    <Input type="password" value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)} placeholder="Minimo 8 caracteres" />
                  </Field>
                  <Field label="Confirmar contrasena *">
                    <Input type="password" value={loginConfirm}
                      onChange={(e) => setLoginConfirm(e.target.value)} placeholder="Repetir contrasena" />
                  </Field>
                </div>
                <Button type="button" size="sm" onClick={handleEnableLogin}
                  disabled={enableLoginMutation.isPending || !loginPassword}>
                  Habilitar acceso al portal
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
