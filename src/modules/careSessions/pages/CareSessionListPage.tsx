import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Eye } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Card, CardContent } from '@/shared/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { useCareSessions, useDeleteCareSession } from '../hooks/useCareSessions'
import { usePermission } from '@/shared/hooks/usePermission'
import { formatDate } from '@/shared/utils/formatDate'
import { toast } from 'sonner'

const TYPE_LABELS: Record<string, string> = { company_visit: 'Visita empresa', particular: 'Particular' }
const STATUS_BADGES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  scheduled: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-yellow-100 text-yellow-800',
}
const STATUS_LABELS: Record<string, string> = {
  completed: 'Completada', scheduled: 'Programada', cancelled: 'Cancelada', no_show: 'Inasistencia',
}

export function CareSessionListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const deleteMutation = useDeleteCareSession()

  const { data, isLoading } = useCareSessions({ limit: 50 })
  const items = (data?.data ?? []).filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      `${s.patient_first_name} ${s.patient_last_name}`.toLowerCase().includes(q) ||
      (s.service_type_name ?? '').toLowerCase().includes(q) ||
      (s.company_name ?? '').toLowerCase().includes(q) ||
      `${s.worker_first_name} ${s.worker_last_name}`.toLowerCase().includes(q)
    )
  })

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Atencion eliminada')
    } catch {
      toast.error('Error al eliminar')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Atenciones"
        description="Historial de sesiones individuales de bienestar y terapia"
        actions={
          hasPermission('care_sessions:create') ? (
            <Button asChild>
              <Link to="/care-sessions/new"><Plus className="mr-2 h-4 w-4" />Nueva atencion</Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex gap-3">
        <Input
          placeholder="Buscar por paciente, servicio, empresa o profesional..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

      <div className="space-y-2">
        {items.map((s) => (
          <Card key={s.id} className="hover:border-primary/30 transition-colors">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {s.patient_first_name} {s.patient_last_name}
                    </span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGES[s.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{TYPE_LABELS[s.session_type]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {s.service_type_name ?? '-'} · {formatDate(s.session_date)}
                    {s.duration_minutes ? ` · ${s.duration_minutes} min` : ''}
                  </p>
                  {s.worker_first_name && (
                    <p className="text-xs text-muted-foreground">Prof: {s.worker_first_name} {s.worker_last_name}</p>
                  )}
                  {s.company_name && (
                    <p className="text-xs text-muted-foreground">Empresa: {s.company_name}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/care-sessions/${s.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {hasPermission('care_sessions:delete') && (
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(s.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && items.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">No hay atenciones registradas.</p>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
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
