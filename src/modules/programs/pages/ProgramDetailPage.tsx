import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Zap, CheckCircle2, Users, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { usePermission } from '@/shared/hooks/usePermission'
import {
  useProgram,
  useProgramAgendas,
  useParticipants,
  useGenerateAgendas,
  useCompleteAgendaService,
  useUpsertParticipants,
  useCreateAgendaService,
} from '../hooks/usePrograms'
import type { AgendaWithServicesDTO, AgendaServiceDetailDTO } from '../api/programsApi'
import { useWorkers } from '@/modules/workers/hooks/useWorkers'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const SERVICE_STATUS_LABELS: Record<string, string> = {
  planned: 'Planificado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

function AgendaServiceRow({ service, programId }: { service: AgendaServiceDetailDTO; programId: string }) {
  const { hasPermission } = usePermission()
  const [participantsOpen, setParticipantsOpen] = useState(false)
  const { data: participants = [], isLoading: loadingPart } = useParticipants(
    participantsOpen ? service.id : '',
  )
  const completeMutation = useCompleteAgendaService(programId)
  const upsertMutation = useUpsertParticipants(service.id)

  const [attendance, setAttendance] = useState<Record<string, boolean>>({})

  function toggleAttend(patientId: string, val: boolean) {
    setAttendance((prev) => ({ ...prev, [patientId]: val }))
  }

  async function saveAttendance() {
    const list = participants.map((p) => ({
      patient_id: p.patient_id,
      attended: attendance[p.patient_id] ?? p.attended,
    }))
    try {
      await upsertMutation.mutateAsync(list)
      toast.success('Asistencia guardada')
    } catch {
      toast.error('Error al guardar asistencia')
    }
  }

  async function handleComplete() {
    try {
      await completeMutation.mutateAsync(service.id)
      toast.success('Servicio completado')
    } catch {
      toast.error('Error al completar servicio')
    }
  }

  return (
    <div className="border rounded-md p-3 text-sm space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-0.5">
          <p className="font-medium">{service.service_type_name ?? '—'}</p>
          {service.worker_name && <p className="text-muted-foreground text-xs">Profesional: {service.worker_name}</p>}
          {service.planned_start_time && (
            <p className="text-muted-foreground text-xs">
              {service.planned_start_time}
              {service.planned_duration_minutes ? ` · ${service.planned_duration_minutes} min` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={service.status === 'completed' ? 'default' : service.status === 'cancelled' ? 'destructive' : 'outline'}>
            {SERVICE_STATUS_LABELS[service.status] ?? service.status}
          </Badge>
          {hasPermission('visits:view') && (
            <Button variant="ghost" size="sm" onClick={() => setParticipantsOpen(true)}>
              <Users className="h-3.5 w-3.5 mr-1" /> Participantes
            </Button>
          )}
          {hasPermission('visits:edit') && service.status === 'planned' && (
            <Button variant="outline" size="sm" onClick={handleComplete} disabled={completeMutation.isPending}>
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Completar
            </Button>
          )}
        </div>
      </div>

      {/* Participants Dialog */}
      <Dialog open={participantsOpen} onOpenChange={setParticipantsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Participantes — {service.service_type_name}</DialogTitle>
          </DialogHeader>
          {loadingPart ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Cargando...</p>
          ) : participants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin participantes registrados</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-1">
                  <span className="text-sm">{p.patient_name ?? p.patient_id}</span>
                  <div className="flex items-center gap-1.5">
                    <Checkbox
                      id={`att-${p.id}`}
                      checked={attendance[p.patient_id] ?? p.attended}
                      onCheckedChange={(v) => toggleAttend(p.patient_id, !!v)}
                      disabled={service.status === 'completed'}
                    />
                    <Label htmlFor={`att-${p.id}`} className="text-xs">Asistió</Label>
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setParticipantsOpen(false)}>Cerrar</Button>
            {hasPermission('visits:edit') && service.status !== 'completed' && participants.length > 0 && (
              <Button onClick={saveAttendance} disabled={upsertMutation.isPending}>
                Guardar asistencia
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AgendaRow({ agenda, programId }: { agenda: AgendaWithServicesDTO; programId: string }) {
  const { hasPermission } = usePermission()
  const { data: serviceTypes = [] } = useServiceTypes()
  const { data: workersData } = useWorkers({ active: true, limit: 200 } as Parameters<typeof useWorkers>[0])
  const workers = workersData?.data ?? []
  const createServiceMutation = useCreateAgendaService(agenda.id, programId)
  const [open, setOpen] = useState(false)
  const [addServiceOpen, setAddServiceOpen] = useState(false)
  const [newServiceTypeId, setNewServiceTypeId] = useState('')
  const [newWorkerId, setNewWorkerId] = useState('')

  async function handleAddService() {
    if (!newServiceTypeId) return
    try {
      await createServiceMutation.mutateAsync({
        agenda_id: agenda.id,
        service_type_id: newServiceTypeId,
        worker_id: newWorkerId || undefined,
      })
      toast.success('Servicio agregado')
      setAddServiceOpen(false)
      setNewServiceTypeId('')
      setNewWorkerId('')
    } catch {
      toast.error('Error al agregar servicio')
    }
  }

  const date = new Date(agenda.scheduled_date)
  const dateLabel = date.toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="border rounded-lg">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium capitalize">{dateLabel}</span>
          {agenda.scheduled_start && <span className="text-muted-foreground">{agenda.scheduled_start}</span>}
          <Badge variant={agenda.status === 'completed' ? 'default' : 'outline'} className="text-xs">
            {agenda.status === 'completed' ? 'Completada' : 'Programada'}
          </Badge>
          <span className="text-xs text-muted-foreground">{(agenda.services ?? []).length} servicio(s)</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {(agenda.services ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground italic">Sin servicios registrados</p>
          )}
          {(agenda.services ?? []).map((svc) => (
            <AgendaServiceRow key={svc.id} service={svc} programId={programId} />
          ))}
          {hasPermission('visits:edit') && (
            <div className="pt-1">
              {!addServiceOpen ? (
                <Button variant="ghost" size="sm" onClick={() => setAddServiceOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Agregar servicio
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={newServiceTypeId} onValueChange={setNewServiceTypeId}>
                    <SelectTrigger className="w-44 h-8">
                      <SelectValue placeholder="Tipo de servicio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((st) => (
                        <SelectItem key={st.id} value={st.id}>{st.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newWorkerId || 'none'} onValueChange={(v) => setNewWorkerId(v === 'none' ? '' : v)}>
                    <SelectTrigger className="w-44 h-8">
                      <SelectValue placeholder="Profesional (opc.)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {workers.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.first_name} {w.last_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={handleAddService} disabled={!newServiceTypeId || createServiceMutation.isPending}>
                    Agregar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAddServiceOpen(false)}>
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ProgramDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { hasPermission } = usePermission()
  const { data: programData, isLoading } = useProgram(id ?? '')
  const program = programData?.program
  const { data: agendas = [], isLoading: loadingAgendas, refetch: refetchAgendas } = useProgramAgendas(id ?? '')
  const generateMutation = useGenerateAgendas(id ?? '')

  async function handleGenerate() {
    try {
      const result = await generateMutation.mutateAsync()
      toast.success(`${result.count} agenda(s) generada(s)`)
      refetchAgendas()
    } catch {
      toast.error('Error al generar agendas')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Cargando programa...</p>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">Programa no encontrado</p>
        <Button variant="outline" onClick={() => navigate('/programs')}>Volver</Button>
      </div>
    )
  }

  const statusLabel = STATUS_LABELS[program.status] ?? program.status
  const statusVariant: 'default' | 'secondary' | 'outline' | 'destructive' =
    program.status === 'active' ? 'default' :
    program.status === 'completed' ? 'secondary' :
    program.status === 'cancelled' ? 'destructive' : 'outline'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/programs')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader
          title={program.name}
          actions={
            hasPermission('contracts:edit') ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleGenerate} disabled={generateMutation.isPending}>
                  <Zap className="h-4 w-4 mr-2" />
                  {agendas.length === 0 ? 'Generar agendas' : 'Regenerar agendas'}
                </Button>
                <Button onClick={() => navigate(`/programs/${id}/edit`)}>Editar</Button>
              </div>
            ) : undefined
          }
        />
      </div>

      {/* Program summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Información general
            <Badge variant={statusVariant}>{statusLabel}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Inicio</p>
            <p>{new Date(program.start_date).toLocaleDateString('es-CL')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Fin</p>
            <p>{program.end_date ? new Date(program.end_date).toLocaleDateString('es-CL') : '—'}</p>
          </div>
          {program.notes && (
            <div className="col-span-2">
              <p className="text-muted-foreground text-xs mb-0.5">Notas</p>
              <p>{program.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agendas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Agendas ({agendas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAgendas ? (
            <p className="text-sm text-muted-foreground text-center py-4">Cargando agendas...</p>
          ) : agendas.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-muted-foreground text-sm">Sin agendas generadas</p>
              {hasPermission('contracts:edit') && (
                <Button variant="outline" onClick={handleGenerate} disabled={generateMutation.isPending}>
                  <Zap className="h-4 w-4 mr-2" />
                  Generar agendas ahora
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {agendas.map((agenda) => (
                <AgendaRow key={agenda.id} agenda={agenda} programId={id ?? ''} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
