import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, Users, Building2, Calendar } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useVisit } from '../hooks/useVisits'
import { useCareSessions, useGroupSessions } from '@/modules/careSessions/hooks/useCareSessions'
import { usePermission } from '@/shared/hooks/usePermission'
import { formatDate } from '@/shared/utils/formatDate'

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada', in_progress: 'En curso', completed: 'Completada',
  cancelled: 'Cancelada', no_show: 'Inasistencia',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  scheduled: 'secondary', in_progress: 'default', completed: 'default',
  cancelled: 'destructive', no_show: 'outline',
}
const SESSION_STATUS_BADGES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800', scheduled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800', no_show: 'bg-yellow-100 text-yellow-800',
}
const SESSION_STATUS_LABELS: Record<string, string> = {
  completed: 'Completada', scheduled: 'Programada', cancelled: 'Cancelada', no_show: 'Inasistencia',
}

export function VisitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const { data: visit, isLoading } = useVisit(id!)
  const { data: sessionsData } = useCareSessions({ visit_id: id, limit: 100 })
  const { data: groupSessions } = useGroupSessions(id!)

  const careSessions = sessionsData?.data ?? []

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
  if (!visit) return <div className="p-8 text-center text-muted-foreground">Agenda no encontrada</div>

  const dateStr = new Date(visit.scheduled_date).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold capitalize">{dateStr}</h1>
              <Badge variant={STATUS_VARIANTS[visit.status] ?? 'outline'}>
                {STATUS_LABELS[visit.status] ?? visit.status}
              </Badge>
            </div>
            {(visit.company_name || visit.company_fantasy_name) && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Building2 className="h-3.5 w-3.5" />
                {visit.company_fantasy_name ?? visit.company_name}
              </p>
            )}
          </div>
        </div>
        {hasPermission('visits:edit') && (
          <Button onClick={() => navigate(`/agendas/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </Button>
        )}
      </div>

      <Tabs defaultValue="detalle">
        <TabsList>
          <TabsTrigger value="detalle">Detalle</TabsTrigger>
          <TabsTrigger value="profesionales">
            Profesionales ({visit.workers?.length ?? 0})
          </TabsTrigger>
          <TabsTrigger value="atenciones">
            Atenciones ({careSessions.length})
          </TabsTrigger>
          {(groupSessions?.length ?? 0) > 0 && (
            <TabsTrigger value="grupales">
              Grupales ({groupSessions?.length ?? 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="detalle" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Datos de la agenda</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">{formatDate(visit.scheduled_date)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Horario</p>
                <p className="font-medium">
                  {visit.scheduled_start ?? ''}{visit.scheduled_end ? `  ${visit.scheduled_end}` : ''}
                </p>
              </div>
              {visit.actual_start && (
                <div>
                  <p className="text-xs text-muted-foreground">Inicio real</p>
                  <p className="font-medium">
                    {new Date(visit.actual_start).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {visit.general_notes && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Notas generales</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{visit.general_notes}</p></CardContent>
            </Card>
          )}

          {visit.cancellation_reason && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2"><CardTitle className="text-base text-destructive">Motivo de cancelacion</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-destructive">{visit.cancellation_reason}</p></CardContent>
            </Card>
          )}

          {visit.internal_report && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Informe interno</CardTitle></CardHeader>
              <CardContent><p className="text-sm whitespace-pre-wrap">{visit.internal_report}</p></CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profesionales" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />Profesionales asignados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!visit.workers || visit.workers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin profesionales asignados. Edita la agenda para asignarlos.</p>
              ) : (
                <div className="space-y-1">
                  {visit.workers.map((w) => (
                    <div key={w.worker_id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{w.first_name} {w.last_name}</p>
                        {w.role_title && <p className="text-xs text-muted-foreground">{w.role_title}</p>}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{w.role_in_visit}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atenciones" className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Este módulo se mantiene por compatibilidad. Las nuevas consultas clínicas se registran desde citas individuales.
          </p>
          {careSessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">No hay atenciones individuales registradas para esta agenda.</p>
              </CardContent>
            </Card>
          ) : (
            careSessions.map((s) => (
              <Card key={s.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{s.patient_first_name} {s.patient_last_name}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SESSION_STATUS_BADGES[s.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {SESSION_STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {s.service_type_name ?? 'Atencion'}{s.duration_minutes ? `  ${s.duration_minutes} min` : ''}
                      </p>
                      {s.worker_first_name && (
                        <p className="text-xs text-muted-foreground">Prof: {s.worker_first_name} {s.worker_last_name}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/care-sessions/${s.id}`}>Ver</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="grupales" className="mt-4 space-y-3">
          {(groupSessions ?? []).map((g) => (
            <Card key={g.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{g.service_type_name ?? 'Sesion grupal'}</p>
                    <p className="text-sm text-muted-foreground">
                      {g.attendee_count} participantes  {formatDate(g.session_date)}
                      {g.duration_minutes ? `  ${g.duration_minutes} min` : ''}
                    </p>
                    {g.worker_first_name && (
                      <p className="text-xs text-muted-foreground">Prof: {g.worker_first_name} {g.worker_last_name}</p>
                    )}
                    {g.notes && <p className="mt-1.5 text-xs text-muted-foreground">{g.notes}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                    <Calendar className="h-3 w-3" />{formatDate(g.session_date)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
