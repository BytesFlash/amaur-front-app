import { Users, Building2, CalendarCheck, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { KpiCard } from '../components/KpiCard'
import { useAuthStore } from '@/app/stores/authStore'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bienvenido, ${user?.first_name ?? ''}`}
        description="Resumen general del sistema AMAUR"
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Pacientes activos"
          value="—"
          description="Total en sistema"
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title="Empresas"
          value="—"
          description="Con contrato vigente"
          icon={<Building2 className="h-5 w-5" />}
        />
        <KpiCard
          title="Visitas este mes"
          value="—"
          description="Sesiones registradas"
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <KpiCard
          title="Seguimientos pendientes"
          value="—"
          description="Requieren contacto"
          icon={<AlertCircle className="h-5 w-5" />}
        />
      </div>

      {/* Placeholder for charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Visitas por mes</h2>
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Gráfico disponible próximamente
          </div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Próximas citas</h2>
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            Sin citas programadas
          </div>
        </div>
      </div>
    </div>
  )
}
