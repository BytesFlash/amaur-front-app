import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarClock, Clock3, FileText, Pencil, UserRound, UserRoundCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Textarea } from '@/shared/components/ui/textarea'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { usePermission } from '@/shared/hooks/usePermission'
import { formatDate } from '@/shared/utils/formatDate'
import { useClinicalRecord, usePatient } from '@/modules/patients/hooks/usePatients'
import { useAppointment, useAppointmentsByPatient, useUpdateAppointment } from '../hooks/useAppointments'
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_OPTIONS,
  APPOINTMENT_STATUS_VARIANTS,
} from '../lib/status'

type AppointmentFlowTab = 'overview' | 'patient-record' | 'history' | 'session-record'

const ENABLED_FLOW_STATUSES = new Set(['in_progress', 'completed'])

function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-CL', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

export function AppointmentDetailPage() {
  const navigate = useNavigate()
  const { id = '' } = useParams<{ id: string }>()
  const { hasPermission } = usePermission()
  const canEdit = hasPermission('appointments:edit')

  const { data: appointment, isLoading } = useAppointment(id)
  const updateMutation = useUpdateAppointment(id)
  const [status, setStatus] = useState('')
  const [activeTab, setActiveTab] = useState<AppointmentFlowTab>('overview')
  const [clinicalDraft, setClinicalDraft] = useState({
    chief_complaint: '',
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    notes: '',
    follow_up_required: false,
    follow_up_date: '',
    follow_up_notes: '',
  })

  const patientId = appointment?.patient_id ?? ''
  const flowEnabled = appointment ? ENABLED_FLOW_STATUSES.has(appointment.status) : false

  const { data: patient } = usePatient(patientId)
  const { data: patientClinicalRecord } = useClinicalRecord(patientId)
  const { data: patientAppointmentsResponse } = useAppointmentsByPatient(patientId, 20)

  const patientHistory = useMemo(() => {
    const items = patientAppointmentsResponse?.data ?? []
    return items.filter((item) => item.id !== appointment?.id)
  }, [appointment?.id, patientAppointmentsResponse?.data])

  useEffect(() => {
    setStatus(appointment?.status ?? '')
  }, [appointment?.status])

  useEffect(() => {
    if (!appointment) return
    setClinicalDraft({
      chief_complaint: appointment.chief_complaint ?? '',
      subjective: appointment.subjective ?? '',
      objective: appointment.objective ?? '',
      assessment: appointment.assessment ?? '',
      plan: appointment.plan ?? '',
      notes: appointment.notes ?? '',
      follow_up_required: Boolean(appointment.follow_up_required),
      follow_up_date: appointment.follow_up_date ? appointment.follow_up_date.slice(0, 10) : '',
      follow_up_notes: appointment.follow_up_notes ?? '',
    })
  }, [appointment])

  useEffect(() => {
    if (!flowEnabled && activeTab !== 'overview') {
      setActiveTab('overview')
    }
  }, [activeTab, flowEnabled])

  useEffect(() => {
    if (appointment?.status === 'in_progress' && activeTab === 'overview') {
      setActiveTab('session-record')
    }
  }, [activeTab, appointment?.status])

  async function saveStatus() {
    if (!appointment || !status || status === appointment.status) return
    try {
      await updateMutation.mutateAsync({ status })
      toast.success('Estado de la cita actualizado')
    } catch {
      toast.error('No se pudo actualizar el estado')
    }
  }

  async function saveClinical() {
    if (!appointment) return
    try {
      await updateMutation.mutateAsync({
        chief_complaint: clinicalDraft.chief_complaint || undefined,
        subjective: clinicalDraft.subjective || undefined,
        objective: clinicalDraft.objective || undefined,
        assessment: clinicalDraft.assessment || undefined,
        plan: clinicalDraft.plan || undefined,
        notes: clinicalDraft.notes || undefined,
        follow_up_required: clinicalDraft.follow_up_required,
        follow_up_date: clinicalDraft.follow_up_date || undefined,
        follow_up_notes: clinicalDraft.follow_up_notes || undefined,
      })
      toast.success('Registro clinico actualizado')
    } catch {
      toast.error('No se pudo actualizar el registro clinico')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    )
  }

  if (!appointment) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title="Detalle de la cita"
          description={appointment.patient_name ?? 'Cita individual'}
          actions={
            canEdit ? (
              <Button onClick={() => navigate(`/app/appointments/${appointment.id}/edit`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar cita
              </Button>
            ) : undefined
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flujo de atencion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Estado actual</p>
              <Badge variant={APPOINTMENT_STATUS_VARIANTS[appointment.status] ?? 'outline'}>
                {APPOINTMENT_STATUS_LABELS[appointment.status] ?? appointment.status}
              </Badge>
            </div>
            {!flowEnabled ? (
              <p className="max-w-md text-xs text-muted-foreground">
                Para habilitar ficha clinica, historial y registro de atencion, cambia la cita a estado "Atendiendo".
              </p>
            ) : (
              <p className="max-w-md text-xs text-emerald-700">
                Flujo clinico habilitado. Ya puedes revisar ficha, historial y registrar la atencion.
              </p>
            )}
          </div>

          {canEdit ? (
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={saveStatus}
                disabled={updateMutation.isPending || !status || status === appointment.status}
              >
                {updateMutation.isPending ? 'Guardando...' : 'Guardar estado'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tienes permiso para cambiar estado.</p>
          )}
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as AppointmentFlowTab)}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="overview" className="rounded-full border bg-background px-4">
            Detalle y paciente
          </TabsTrigger>
          <TabsTrigger
            value="patient-record"
            disabled={!flowEnabled}
            className="rounded-full border bg-background px-4"
          >
            Ficha clinica
          </TabsTrigger>
          <TabsTrigger value="history" disabled={!flowEnabled} className="rounded-full border bg-background px-4">
            Historial de atencion
          </TabsTrigger>
          <TabsTrigger
            value="session-record"
            disabled={!flowEnabled}
            className="rounded-full border bg-background px-4 font-semibold"
          >
            Registro de la atencion
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumen del agendamiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailRow
                  icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
                  label="Paciente"
                  value={appointment.patient_name ?? appointment.patient_id}
                />
                <Separator />
                <DetailRow
                  icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                  label="Servicio"
                  value={appointment.service_type_name ?? 'Servicio sin nombre'}
                />
                <DetailRow
                  icon={<UserRoundCheck className="h-4 w-4 text-muted-foreground" />}
                  label="Profesional"
                  value={appointment.worker_name ?? 'Sin profesional asignado'}
                />
                <DetailRow
                  icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
                  label="Fecha y hora"
                  value={formatDateTime(appointment.scheduled_at)}
                />
                <DetailRow
                  icon={<Clock3 className="h-4 w-4 text-muted-foreground" />}
                  label="Duracion"
                  value={appointment.duration_minutes ? `${appointment.duration_minutes} min` : '60 min'}
                />
                <DetailRow label="Modalidad" value={appointment.company_id ? 'Empresa' : 'Particular'} />
                <DetailRow label="Empresa" value={appointment.company_name ?? '-'} />
                <DetailRow label="Recurrente" value={appointment.recurring_group_id ? 'Si' : 'No'} />
                <DetailRow label="Creada el" value={formatDateTime(appointment.created_at)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Datos del paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Nombre" value={appointment.patient_name ?? '-'} />
                <DetailRow label="RUT" value={patient?.rut ?? '-'} />
                <DetailRow label="Telefono" value={patient?.phone ?? '-'} />
                <DetailRow label="Correo" value={patient?.email ?? '-'} />
                <DetailRow label="Ciudad" value={patient?.city ?? '-'} />
                <DetailRow label="Region" value={patient?.region ?? '-'} />

                <Button asChild variant="outline" className="mt-2 w-full">
                  <Link to={`/app/patients/${appointment.patient_id}`}>Abrir ficha completa del paciente</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patient-record">
          {!flowEnabled ? (
            <BlockedFlowMessage />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ficha clinica del paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {patientClinicalRecord ? (
                  <>
                    {patientClinicalRecord.alerts ? (
                      <div className="rounded-md border border-amber-300 bg-amber-50 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">Alertas</p>
                        <p className="mt-1 text-sm text-amber-900">{patientClinicalRecord.alerts}</p>
                      </div>
                    ) : null}
                    <RecordGridItem label="Diagnostico principal" value={patientClinicalRecord.main_diagnosis} />
                    <RecordGridItem label="Antecedentes relevantes" value={patientClinicalRecord.relevant_history} />
                    <RecordGridItem label="Antecedentes familiares" value={patientClinicalRecord.family_history} />
                    <RecordGridItem label="Medicamentos" value={patientClinicalRecord.current_medications} />
                    <RecordGridItem label="Alergias" value={patientClinicalRecord.allergies} />
                    <RecordGridItem label="Restricciones fisicas" value={patientClinicalRecord.physical_restrictions} />
                    <RecordGridItem label="Ocupacion" value={patientClinicalRecord.occupation} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">El paciente aun no tiene ficha clinica registrada.</p>
                )}

                <Button asChild variant="outline">
                  <Link to={`/app/patients/${appointment.patient_id}`}>Ir a ficha del paciente</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          {!flowEnabled ? (
            <BlockedFlowMessage />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Historial de atencion del paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patientHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin atenciones previas registradas.</p>
                ) : (
                  patientHistory.map((item) => (
                    <article key={item.id} className="rounded-md border p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{item.service_type_name ?? 'Cita'}</p>
                        <Badge variant={APPOINTMENT_STATUS_VARIANTS[item.status] ?? 'outline'} className="text-xs">
                          {APPOINTMENT_STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(item.scheduled_at)} {item.duration_minutes ? ` ${item.duration_minutes} min` : ''}
                      </p>
                      {item.worker_name ? <p className="mt-1 text-xs text-muted-foreground">Prof: {item.worker_name}</p> : null}
                      {item.chief_complaint ? <p className="mt-2 text-sm text-muted-foreground">Motivo: {item.chief_complaint}</p> : null}
                    </article>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="session-record">
          {!flowEnabled ? (
            <BlockedFlowMessage />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Registro de la atencion (principal)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ClinicalField label="Motivo de consulta">
                  <Textarea
                    rows={2}
                    value={clinicalDraft.chief_complaint}
                    onChange={(event) =>
                      setClinicalDraft((prev) => ({ ...prev, chief_complaint: event.target.value }))
                    }
                    disabled={!canEdit}
                  />
                </ClinicalField>
                <ClinicalField label="Subjetivo">
                  <Textarea
                    rows={2}
                    value={clinicalDraft.subjective}
                    onChange={(event) => setClinicalDraft((prev) => ({ ...prev, subjective: event.target.value }))}
                    disabled={!canEdit}
                  />
                </ClinicalField>
                <ClinicalField label="Objetivo">
                  <Textarea
                    rows={2}
                    value={clinicalDraft.objective}
                    onChange={(event) => setClinicalDraft((prev) => ({ ...prev, objective: event.target.value }))}
                    disabled={!canEdit}
                  />
                </ClinicalField>
                <ClinicalField label="Evaluacion">
                  <Textarea
                    rows={2}
                    value={clinicalDraft.assessment}
                    onChange={(event) => setClinicalDraft((prev) => ({ ...prev, assessment: event.target.value }))}
                    disabled={!canEdit}
                  />
                </ClinicalField>
                <ClinicalField label="Plan">
                  <Textarea
                    rows={2}
                    value={clinicalDraft.plan}
                    onChange={(event) => setClinicalDraft((prev) => ({ ...prev, plan: event.target.value }))}
                    disabled={!canEdit}
                  />
                </ClinicalField>
                <ClinicalField label="Notas">
                  <Textarea
                    rows={2}
                    value={clinicalDraft.notes}
                    onChange={(event) => setClinicalDraft((prev) => ({ ...prev, notes: event.target.value }))}
                    disabled={!canEdit}
                  />
                </ClinicalField>

                <div className="flex items-center gap-2 rounded-md border p-3">
                  <input
                    id="follow-up-required-detail"
                    type="checkbox"
                    checked={clinicalDraft.follow_up_required}
                    onChange={(event) =>
                      setClinicalDraft((prev) => ({ ...prev, follow_up_required: event.target.checked }))
                    }
                    disabled={!canEdit}
                  />
                  <Label htmlFor="follow-up-required-detail">Requiere seguimiento</Label>
                </div>

                {clinicalDraft.follow_up_required ? (
                  <div className="space-y-2 rounded-md border border-dashed p-3">
                    <ClinicalField label="Fecha de seguimiento">
                      <Input
                        type="date"
                        value={clinicalDraft.follow_up_date}
                        onChange={(event) =>
                          setClinicalDraft((prev) => ({ ...prev, follow_up_date: event.target.value }))
                        }
                        disabled={!canEdit}
                      />
                    </ClinicalField>
                    <ClinicalField label="Notas de seguimiento">
                      <Textarea
                        rows={2}
                        value={clinicalDraft.follow_up_notes}
                        onChange={(event) =>
                          setClinicalDraft((prev) => ({ ...prev, follow_up_notes: event.target.value }))
                        }
                        disabled={!canEdit}
                      />
                    </ClinicalField>
                  </div>
                ) : null}

                {canEdit ? (
                  <Button className="w-full" onClick={saveClinical} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Guardando...' : 'Guardar registro de atencion'}
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No tienes permiso para editar el registro de atencion.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon?: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="max-w-[62%] text-right text-sm font-medium">{value}</span>
    </div>
  )
}

function ClinicalField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}

function BlockedFlowMessage() {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">
          Este bloque se habilita cuando la cita pasa a estado "Atendiendo".
        </p>
      </CardContent>
    </Card>
  )
}

function RecordGridItem({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{value}</p>
    </div>
  )
}
