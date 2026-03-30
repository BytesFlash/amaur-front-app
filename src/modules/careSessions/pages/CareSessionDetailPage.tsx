import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useCareSession, useUpdateCareSession, useDeleteCareSession } from '../hooks/useCareSessions'
import { usePermission } from '@/shared/hooks/usePermission'
import { formatDate } from '@/shared/utils/formatDate'
import { toast } from 'sonner'

const STATUS_BADGES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-yellow-100 text-yellow-800',
}
const STATUS_LABELS: Record<string, string> = {
  completed: 'Completada', scheduled: 'Programada', cancelled: 'Cancelada', no_show: 'Inasistencia',
}

type SOAPState = { chief_complaint: string; subjective: string; objective: string; assessment: string; plan: string }
type FollowupState = { follow_up_status: string; follow_up_date: string; follow_up_notes: string }

export function CareSessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const { data: session, isLoading } = useCareSession(id ?? '')
  const updateMutation = useUpdateCareSession(id ?? '')
  const deleteMutation = useDeleteCareSession()

  const [isEditingSOAP, setIsEditingSOAP] = useState(false)
  const [soap, setSOAP] = useState<SOAPState>({ chief_complaint: '', subjective: '', objective: '', assessment: '', plan: '' })
  const [isEditingFollowup, setIsEditingFollowup] = useState(false)
  const [followup, setFollowup] = useState<FollowupState>({ follow_up_status: '', follow_up_date: '', follow_up_notes: '' })
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading) return <div className="py-12 text-center text-sm text-muted-foreground">Cargando...</div>
  if (!session) return <div className="py-12 text-center text-sm text-muted-foreground">Atencion no encontrada.</div>

  function startEditSOAP() {
    setSOAP({
      chief_complaint: session!.chief_complaint ?? '',
      subjective: session!.subjective ?? '',
      objective: session!.objective ?? '',
      assessment: session!.assessment ?? '',
      plan: session!.plan ?? '',
    })
    setIsEditingSOAP(true)
  }

  async function saveSOAP() {
    try {
      await updateMutation.mutateAsync(soap)
      toast.success('Notas SOAP guardadas')
      setIsEditingSOAP(false)
    } catch {
      toast.error('Error al guardar')
    }
  }

  function startEditFollowup() {
    setFollowup({
      follow_up_status: session!.follow_up_status ?? '',
      follow_up_date: session!.follow_up_date?.slice(0, 10) ?? '',
      follow_up_notes: session!.follow_up_notes ?? '',
    })
    setIsEditingFollowup(true)
  }

  async function saveFollowup() {
    try {
      await updateMutation.mutateAsync({ follow_up_required: true, ...followup })
      toast.success('Seguimiento actualizado')
      setIsEditingFollowup(false)
    } catch {
      toast.error('Error al guardar')
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id!)
      toast.success('Atencion eliminada')
      navigate('/care-sessions')
    } catch {
      toast.error('Error al eliminar')
    }
  }

  const soapFields: [keyof SOAPState, string][] = [
    ['chief_complaint', 'Motivo de consulta'],
    ['subjective', 'Subjetivo (S)'],
    ['objective', 'Objetivo (O)'],
    ['assessment', 'Evaluacion (A)'],
    ['plan', 'Plan (P)'],
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-semibold">
              {session.patient_first_name} {session.patient_last_name}
            </h1>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[session.status] ?? 'bg-gray-100 text-gray-700'}`}>
              {STATUS_LABELS[session.status] ?? session.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {session.service_type_name} · {formatDate(session.session_date)}
            {session.duration_minutes ? ` · ${session.duration_minutes} min` : ''}
          </p>
        </div>
        {hasPermission('care_sessions:edit') && (
          <Button variant="outline" asChild>
            <Link to={`/care-sessions/${id}/edit`}><Edit className="mr-2 h-4 w-4" />Editar</Link>
          </Button>
        )}
        {hasPermission('care_sessions:delete') && (
          <Button variant="outline" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-2 h-4 w-4 text-destructive" />Eliminar
          </Button>
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardContent className="pt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div><span className="text-muted-foreground">Profesional: </span>{session.worker_first_name} {session.worker_last_name}</div>
          <div><span className="text-muted-foreground">Empresa: </span>{session.company_name ?? '—'}</div>
          <div><span className="text-muted-foreground">Tipo: </span>{session.session_type === 'company_visit' ? 'Visita empresa' : 'Particular'}</div>
          <div><span className="text-muted-foreground">Hora: </span>{session.session_time ?? '—'}</div>
        </CardContent>
      </Card>

      {/* SOAP */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Notas clinicas (SOAP)</CardTitle>
          {hasPermission('care_sessions:edit') && !isEditingSOAP && (
            <Button variant="ghost" size="sm" onClick={startEditSOAP}>
              <Edit className="mr-1 h-4 w-4" />Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingSOAP ? (
            <>
              {soapFields.map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <Label>{label}</Label>
                  <Textarea
                    rows={3}
                    value={soap[key]}
                    onChange={(e) => setSOAP((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <Button size="sm" onClick={saveSOAP} disabled={updateMutation.isPending}>Guardar</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingSOAP(false)}>Cancelar</Button>
              </div>
            </>
          ) : (
            <>
              {session.chief_complaint && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Motivo de consulta</p>
                  <p className="text-sm whitespace-pre-wrap">{session.chief_complaint}</p>
                </div>
              )}
              {session.subjective && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Subjetivo</p>
                  <p className="text-sm whitespace-pre-wrap">{session.subjective}</p>
                </div>
              )}
              {session.objective && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Objetivo</p>
                  <p className="text-sm whitespace-pre-wrap">{session.objective}</p>
                </div>
              )}
              {session.assessment && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Evaluacion</p>
                  <p className="text-sm whitespace-pre-wrap">{session.assessment}</p>
                </div>
              )}
              {session.plan && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Plan</p>
                  <p className="text-sm whitespace-pre-wrap">{session.plan}</p>
                </div>
              )}
              {!session.chief_complaint && !session.subjective && !session.objective && !session.assessment && !session.plan && (
                <p className="text-sm text-muted-foreground">Sin notas SOAP registradas.</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {session.notes && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Notas generales</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{session.notes}</p></CardContent>
        </Card>
      )}

      {/* Follow-up */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Seguimiento</CardTitle>
          {hasPermission('care_sessions:edit') && !isEditingFollowup && (
            <Button variant="ghost" size="sm" onClick={startEditFollowup}>
              <Edit className="mr-1 h-4 w-4" />Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingFollowup ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Estado seguimiento</Label>
                  <Input
                    value={followup.follow_up_status}
                    onChange={(e) => setFollowup((p) => ({ ...p, follow_up_status: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Fecha seguimiento</Label>
                  <Input
                    type="date"
                    value={followup.follow_up_date}
                    onChange={(e) => setFollowup((p) => ({ ...p, follow_up_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Notas de seguimiento</Label>
                <Textarea
                  rows={3}
                  value={followup.follow_up_notes}
                  onChange={(e) => setFollowup((p) => ({ ...p, follow_up_notes: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={saveFollowup} disabled={updateMutation.isPending}>Guardar</Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditingFollowup(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div><span className="text-muted-foreground">Requiere seguimiento: </span>{session.follow_up_required ? 'Si' : 'No'}</div>
              {session.follow_up_status && <div><span className="text-muted-foreground">Estado: </span>{session.follow_up_status}</div>}
              {session.follow_up_date && <div><span className="text-muted-foreground">Fecha: </span>{formatDate(session.follow_up_date)}</div>}
              {session.follow_up_notes && <div className="col-span-2"><span className="text-muted-foreground">Notas: </span>{session.follow_up_notes}</div>}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar atencion</AlertDialogTitle>
            <AlertDialogDescription>Esta accion no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
