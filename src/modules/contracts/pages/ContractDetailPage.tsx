import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { useContract, useContractServices } from '../hooks/useContracts'
import { extractApiErrorMessage } from '@/shared/utils/apiError'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', active: 'Activo', paused: 'Pausado', expired: 'Vencido', terminated: 'Terminado',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline', active: 'default', paused: 'secondary', expired: 'destructive', terminated: 'destructive',
}

function formatLocalDate(dateValue?: string) {
  if (!dateValue) return '—'
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-CL')
}

export function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: contract, isLoading } = useContract(id!)
  const {
    data: services = [],
    isLoading: servicesLoading,
    isError: servicesError,
    error: servicesQueryError,
  } = useContractServices(id!)

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>
  if (!contract) return <div className="p-8 text-center text-muted-foreground">Contrato no encontrado</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title={contract.name} />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[contract.status] ?? 'outline'}>{STATUS_LABELS[contract.status] ?? contract.status}</Badge>
          <Button onClick={() => navigate(`/contracts/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Información del contrato</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Tipo</p>
              <p className="font-medium">{contract.contract_type ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ciclo de facturación</p>
              <p className="font-medium">{contract.billing_cycle ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha inicio</p>
              <p className="font-medium">{formatLocalDate(contract.start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha vencimiento</p>
              <p className="font-medium">{contract.end_date ? formatLocalDate(contract.end_date) : '—'}</p>
            </div>
            {contract.value_clp != null && (
              <div>
                <p className="text-xs text-muted-foreground">Valor (CLP)</p>
                <p className="font-medium">${contract.value_clp.toLocaleString('es-CL')}</p>
              </div>
            )}
            {contract.renewal_date && (
              <div>
                <p className="text-xs text-muted-foreground">Renovación</p>
                <p className="font-medium">{formatLocalDate(contract.renewal_date)}</p>
              </div>
            )}
            {contract.notes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Notas</p>
                <p>{contract.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Servicios contratados</CardTitle></CardHeader>
          <CardContent>
            {servicesLoading ? (
              <p className="text-sm text-muted-foreground">Cargando servicios asociados...</p>
            ) : servicesError ? (
              <p className="text-sm text-destructive">
                {extractApiErrorMessage(servicesQueryError, 'No se pudieron cargar los servicios asociados')}
              </p>
            ) : services.length === 0 ? (
              <p className="text-sm text-muted-foreground">Este contrato no tiene servicios asociados.</p>
            ) : (
              <div className="space-y-3">
                {services.map(s => (
                  <div key={s.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{s.service_type_name ?? 'Servicio sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">
                          Cupo {s.quota_type === 'sessions' ? 'por sesiones' : s.quota_type === 'hours' ? 'por horas' : 'ilimitado'}
                        </p>
                      </div>
                      <Badge variant="outline">{s.quota_type}</Badge>
                    </div>

                    {s.sessions_included != null && (
                      <p className="text-xs text-muted-foreground">
                        Sesiones usadas: {s.sessions_used} / {s.sessions_included}
                      </p>
                    )}

                    {s.hours_included != null && (
                      <p className="text-xs text-muted-foreground">
                        Horas usadas: {s.hours_used} / {s.hours_included}
                      </p>
                    )}

                    {s.quantity_per_period != null && (
                      <p className="text-xs text-muted-foreground">
                        Frecuencia: {s.quantity_per_period} por {s.period_unit === 'month' ? 'mes' : s.period_unit === 'week' ? 'semana' : 'contrato'}
                      </p>
                    )}

                    {s.price_per_unit != null && (
                      <p className="text-xs text-muted-foreground">
                        Precio por unidad: ${s.price_per_unit.toLocaleString('es-CL')}
                      </p>
                    )}

                    {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
