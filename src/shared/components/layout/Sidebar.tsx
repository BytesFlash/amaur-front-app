import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Building2,
  HardHat,
  FileText,
  UserCog,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  CalendarDays,
  Briefcase,
  Tag,
  CalendarRange,
  Newspaper,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/app/stores/authStore'
import { useUIStore } from '@/app/stores/uiStore'

const navItems = [
  { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard, permission: null, exact: true },
  { label: 'Pacientes', to: '/app/patients', icon: Users, permission: 'patients:view', exact: false },
  { label: 'Empresas', to: '/app/companies', icon: Building2, permission: 'companies:view', exact: false },
  { label: 'Profesionales', to: '/app/workers', icon: HardHat, permission: 'workers:view', exact: true },
  { label: 'Horarios', to: '/app/workers/calendar', icon: CalendarRange, permission: 'workers:view', exact: false },
  { label: 'Citas individuales', to: '/app/appointments', icon: CalendarDays, permission: 'appointments:view', exact: false },
  { label: 'Contratos', to: '/app/contracts', icon: FileText, permission: 'contracts:view', exact: false },
  { label: 'Programas', to: '/app/programs', icon: Briefcase, permission: 'contracts:view', exact: false },
  { label: 'Tipos de servicio', to: '/app/service-types', icon: Tag, permission: 'care_sessions:view', exact: false },
  { label: 'Usuarios', to: '/app/users', icon: UserCog, permission: 'users:view', exact: false },
  { label: 'Roles', to: '/app/roles', icon: ShieldCheck, permission: 'roles:view', exact: false },
  { label: 'Configuracion', to: '/app/settings', icon: Settings, permission: 'settings:view', exact: false },
  { label: 'CMS contenidos', to: '/app/content', icon: Newspaper, permission: 'settings:view', exact: false },
]

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const location = useLocation()

  const visibleItems = navItems.filter((item) => !item.permission || hasPermission(item.permission))

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-border/70 bg-white/70 backdrop-blur-xl transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-border/70 px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#22c55e)] text-white shadow-lg shadow-emerald-900/20">
          <Stethoscope className="h-5 w-5 shrink-0" />
        </div>
        {!collapsed && (
          <span className="ml-3 text-lg font-bold tracking-tight text-primary">AMAUR</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5">
          {visibleItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(item.to + '/')

            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-border/70 p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-secondary"
          aria-label={collapsed ? 'Expandir menu' : 'Colapsar menu'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
