import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Building2, AlertTriangle, Stethoscope, Pill, Shield, ClipboardList, CheckCircle2, XCircle, UserCheck, Users, LogIn } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { StatusBadge } from '@/shared/components/ui/StatusBadge'
import { Badge } from '@/shared/components/ui/badge'
import { usePatient, useClinicalRecord, useUpdateClinicalRecord, usePatientLoginInfo } from '../hooks/usePatients'
import { useCareSessions } from '@/modules/careSessions/hooks/useCareSessions'
import { formatDate } from '@/shared/utils/formatDate'
import { formatRut } from '@/shared/utils/formatRut'
import { usePermission } from '@/shared/hooks/usePermission'
import { useState } from 'react'
import { Textarea } from '@/shared/components/ui/textarea'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { toast } from 'sonner'

const GENDER_LABELS: Record<string, string> = {
  masculino: 'Masculino', femenino: 'Femenino', otro: 'Otro', prefiero_no_decir: 'Prefiero no decir',
}
const TYPE_LABELS: Record<string, string> = {
  particular: 'Particular', company: 'De empresa', both: 'Ambos',
}
const SESSION_TYPE_LABELS: Record<string, string> = {
  company_visit: 'Visita empresa', particular: 'Particular',
}
const SESSION_STATUS_BADGES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800', scheduled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800', no_show: 'bg-yellow-100 text-yellow-800',
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermission()

  const { data: patient, isLoading } = usePatient(id!)
  const { data: clinicalRecord, refetch: refetchRecord } = useClinicalRecord(id!)
  const updateRecord = useUpdateClinicalRecord(id!)
  const { data: loginInfo } = usePatientLoginInfo(id!, true)

  const { data: sessionsData } = useCareSessions({ patient_id: id, limit: 50 })
  const sessions = sessionsData?.data ?? []

  const [editingRecord, setEditingRecord] = useState(false)
  const [recordForm, setRecordForm] = useState<Record<string, string | boolean>>({})

  function startEditRecord() {
    if (clinicalRecord) {
      setRecordForm({
        main_diagnosis: clinicalRecord.main_diagnosis ?? '',
        allergies: clinicalRecord.allergies ?? '',
        current_medications: clinicalRecord.current_medications ?? '',
        relevant_history: clinicalRecord.relevant_history ?? '',
        family_history: clinicalRecord.family_history ?? '',
        physical_restrictions: clinicalRecord.physical_restrictions ?? '',
        alerts: clinicalRecord.alerts ?? '',
        occupation: clinicalRecord.occupation ?? '',
        consent_signed: clinicalRecord.consent_signed ?? false,
      })
    } else {
      setRecordForm({ consent_signed: false })
    }
    setEditingRecord(true)
  }

  async function saveRecord() {
    try {
      await updateRecord.mutateAsync(recordForm as Parameters<typeof updateRecord.mutateAsync>[0])
      toast.success('Ficha clinica actualizada')
      setEditingRecord(false)
      refetchRecord()
    } catch {
      toast.error('Error al guardar')
    }
  }

  if (isLoading) return <div className="space-y-4"><div className="h-8 w-48 animate-pulse rounded bg-muted" /><div className="h-64 animate-pulse rounded-lg bg-muted" /></div>
  if (!patient) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <PageHeader
          title={`${patient.first_name} ${patient.last_name}`}
          description={patient.rut ? formatRut(patient.rut) : undefined}
          actions={
            hasPermission('patients:edit') ? (
              <Button asChild><Link to={`/patients/${patient.id}/edit`}><Pencil className="mr-2 h-4 w-4" />Editar</Link></Button>
            ) : undefined
          }
        />
        <StatusBadge status={patient.status} className="ml-auto" />
      </div>

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos personales</TabsTrigger>
          <TabsTrigger value="ficha">Ficha clinica</TabsTrigger>
          <TabsTrigger value="historial">Historial ({sessions.length})</TabsTrigger>
        </TabsList>

        {/* Datos personales */}
        <TabsContent value="datos" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Informacion personal</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="RUT" value={patient.rut ? formatRut(patient.rut) : '-'} />
                <Field label="Tipo" value={TYPE_LABELS[patient.patient_type] ?? patient.patient_type} />
                <Field label="Fecha de nacimiento" value={formatDate(patient.birth_date)} />
                <Field label="Genero" value={GENDER_LABELS[patient.gender ?? ''] ?? '-'} />
                <Field label="Correo de contacto" value={patient.email ?? '-'} />
                <Field label="Telefono" value={patient.phone ?? '-'} />
                <Field label="Ciudad" value={patient.city ?? '-'} />
                <Field label="Region" value={patient.region ?? '-'} />
                <Field label="Direccion" value={patient.address ?? '-'} />
                {patient.emergency_contact_name && (
                  <Field label="Contacto emergencia" value={`${patient.emergency_contact_name} ${patient.emergency_contact_phone ?? ''}`} />
                )}
                {patient.general_notes && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <dt className="text-xs font-medium text-muted-foreground">Notas</dt>
                    <dd className="mt-0.5 text-sm whitespace-pre-wrap">{patient.general_notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Empresas asociadas */}
          {patient.companies && patient.companies.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Empresas asociadas</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.companies.map((c) => (
                    <div key={c.id} className="flex items-start justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">{c.company_id}</p>
                        {c.position && <p className="text-xs text-muted-foreground">{c.position}{c.department ? ` · ${c.department}` : ''}</p>}
                        {c.start_date && <p className="text-xs text-muted-foreground">Desde {formatDate(c.start_date)}</p>}
                      </div>
                      <Badge variant={c.is_active ? 'default' : 'secondary'} className="text-xs">
                        {c.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tutor */}
          {patient.tutor && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Tutor / Representante legal</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Link to={`/patients/${patient.tutor.id}`} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition-colors">
                  <div>
                    <p className="text-sm font-medium">{patient.tutor.first_name} {patient.tutor.last_name}</p>
                    {patient.tutor.rut && <p className="text-xs text-muted-foreground">{formatRut(patient.tutor.rut)}</p>}
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Menores a cargo (wards) */}
          {patient.wards && patient.wards.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Pacientes a cargo ({patient.wards.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patient.wards.map((w) => (
                    <Link key={w.id} to={`/patients/${w.id}`}
                      className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition-colors">
                      <div>
                        <p className="text-sm font-medium">{w.first_name} {w.last_name}</p>
                        {w.rut && <p className="text-xs text-muted-foreground">{formatRut(w.rut)}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acceso al portal */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Acceso al portal</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loginInfo ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Cuenta activa</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Email: <span className="font-medium text-foreground">{loginInfo.email}</span></p>
                  <p className="text-xs text-muted-foreground">Rol: {loginInfo.roles.join(', ') || 'Sin roles'}</p>
                  {hasPermission('patients:edit') && (
                    <Button asChild size="sm" variant="outline" className="mt-2">
                      <Link to={`/patients/${patient.id}/edit`}>Gestionar acceso</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Sin cuenta de acceso al portal</span>
                  {hasPermission('patients:edit') && (
                    <Button asChild size="sm" variant="outline" className="ml-auto">
                      <Link to={`/patients/${patient.id}/edit`}>Habilitar</Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ficha clinica */}
        <TabsContent value="ficha" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Ficha clinica</CardTitle>
                {hasPermission('clinical_records:edit') && !editingRecord && (
                  <Button variant="outline" size="sm" onClick={startEditRecord}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />{clinicalRecord ? 'Editar' : 'Crear ficha'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {editingRecord ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <RecordField label="Ocupacion"><Input value={String(recordForm.occupation ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, occupation: e.target.value }))} /></RecordField>
                    <RecordField label="Diagnostico principal" className="sm:col-span-2"><Textarea rows={2} value={String(recordForm.main_diagnosis ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, main_diagnosis: e.target.value }))} /></RecordField>
                    <RecordField label="Antecedentes relevantes" className="sm:col-span-2"><Textarea rows={2} value={String(recordForm.relevant_history ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, relevant_history: e.target.value }))} /></RecordField>
                    <RecordField label="Antecedentes familiares" className="sm:col-span-2"><Textarea rows={2} value={String(recordForm.family_history ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, family_history: e.target.value }))} /></RecordField>
                    <RecordField label="Medicamentos actuales"><Textarea rows={2} value={String(recordForm.current_medications ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, current_medications: e.target.value }))} /></RecordField>
                    <RecordField label="Alergias"><Textarea rows={2} value={String(recordForm.allergies ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, allergies: e.target.value }))} /></RecordField>
                    <RecordField label="Restricciones fisicas" className="sm:col-span-2"><Textarea rows={2} value={String(recordForm.physical_restrictions ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, physical_restrictions: e.target.value }))} /></RecordField>
                    <RecordField label="Alertas" className="sm:col-span-2"><Textarea rows={2} value={String(recordForm.alerts ?? '')} onChange={(e) => setRecordForm(p => ({ ...p, alerts: e.target.value }))} /></RecordField>
                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox checked={Boolean(recordForm.consent_signed)} onCheckedChange={(v) => setRecordForm(p => ({ ...p, consent_signed: Boolean(v) }))} id="consent" />
                      <Label htmlFor="consent">Consentimiento firmado</Label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveRecord} disabled={updateRecord.isPending}>Guardar</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingRecord(false)}>Cancelar</Button>
                  </div>
                </div>
              ) : clinicalRecord ? (
                <div className="space-y-5">
                  {/* Alert banner */}
                  {clinicalRecord.alerts && (
                    <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-3">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-0.5">Alertas</p>
                        <p className="text-sm text-amber-900 whitespace-pre-wrap">{clinicalRecord.alerts}</p>
                      </div>
                    </div>
                  )}

                  {/* Consent + occupation row */}
                  <div className="flex flex-wrap gap-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      {clinicalRecord.consent_signed
                        ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                        : <XCircle className="h-4 w-4 text-muted-foreground" />
                      }
                      <span className={`text-sm font-medium ${clinicalRecord.consent_signed ? 'text-green-700' : 'text-muted-foreground'}`}>
                        Consentimiento {clinicalRecord.consent_signed ? 'firmado' : 'pendiente'}
                      </span>
                    </div>
                    {clinicalRecord.occupation && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ClipboardList className="h-4 w-4" />{clinicalRecord.occupation}
                      </div>
                    )}
                  </div>

                  {/* Diagnosis */}
                  {clinicalRecord.main_diagnosis && (
                    <div className="rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Stethoscope className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Diagnostico principal</p>
                      </div>
                      <p className="text-sm text-blue-900 whitespace-pre-wrap">{clinicalRecord.main_diagnosis}</p>
                    </div>
                  )}

                  {/* History grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {clinicalRecord.relevant_history && (
                      <RecordSection title="Antecedentes relevantes" value={clinicalRecord.relevant_history} />
                    )}
                    {clinicalRecord.family_history && (
                      <RecordSection title="Antecedentes familiares" value={clinicalRecord.family_history} />
                    )}
                  </div>

                  {/* Medications + allergies */}
                  {(clinicalRecord.current_medications || clinicalRecord.allergies) && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {clinicalRecord.current_medications && (
                        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Pill className="h-4 w-4 text-violet-600" />
                            <p className="text-xs font-semibold text-violet-800 uppercase tracking-wide">Medicamentos</p>
                          </div>
                          <p className="text-sm text-violet-900 whitespace-pre-wrap">{clinicalRecord.current_medications}</p>
                        </div>
                      )}
                      {clinicalRecord.allergies && (
                        <div className="rounded-lg border border-red-200 bg-red-50/50 p-4">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Shield className="h-4 w-4 text-red-600" />
                            <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Alergias</p>
                          </div>
                          <p className="text-sm text-red-900 whitespace-pre-wrap">{clinicalRecord.allergies}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Physical restrictions */}
                  {clinicalRecord.physical_restrictions && (
                    <RecordSection title="Restricciones fisicas" value={clinicalRecord.physical_restrictions} />
                  )}

                  {/* Audit trail */}
                  <div className="pt-3 border-t flex flex-wrap gap-x-6 gap-y-1">
                    {clinicalRecord.created_by_name && (
                      <p className="text-xs text-muted-foreground">
                        Creada por <span className="font-medium text-foreground">{clinicalRecord.created_by_name}</span>
                        {' '}el {new Date(clinicalRecord.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {clinicalRecord.updated_by_name && clinicalRecord.updated_at && (
                      <p className="text-xs text-muted-foreground">
                        Ultima edicion por <span className="font-medium text-foreground">{clinicalRecord.updated_by_name}</span>
                        {' '}el {new Date(clinicalRecord.updated_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin ficha clinica. Haz clic en "Crear ficha" para agregar.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historial de atenciones */}
        <TabsContent value="historial" className="mt-4">
          <div className="space-y-3">
            {hasPermission('care_sessions:create') && (
              <div className="flex justify-end">
                <Button asChild size="sm">
                  <Link to={`/care-sessions/new?patient_id=${patient.id}`}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />Nueva atencion
                  </Link>
                </Button>
              </div>
            )}
            {sessions.length === 0 && (
              <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">No hay atenciones registradas.</p></CardContent></Card>
            )}
            {sessions.map((s) => (
              <Card key={s.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{s.service_type_name ?? 'Atencion'}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SESSION_STATUS_BADGES[s.status] ?? ''}`}>
                          {s.status}
                        </span>
                        <span className="text-xs text-muted-foreground">{SESSION_TYPE_LABELS[s.session_type]}</span>
                        {s.company_name && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />{s.company_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(s.session_date)} {s.session_time ? ` ${s.session_time}` : ''}
                        {s.duration_minutes ? `  ${s.duration_minutes} min` : ''}
                      </p>
                      {s.worker_first_name && (
                        <p className="text-xs text-muted-foreground mt-0.5">Prof: {s.worker_first_name} {s.worker_last_name}</p>
                      )}
                      {s.notes && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.notes}</p>}
                      {s.follow_up_required && (
                        <Badge variant="outline" className="mt-2 text-xs border-orange-300 text-orange-700">Seguimiento pendiente</Badge>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/care-sessions/${s.id}`}>Ver</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm whitespace-pre-wrap">{value}</dd>
    </div>
  )
}

function RecordField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

function RecordSection({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{title}</p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}
