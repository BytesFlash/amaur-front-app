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
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/app/stores/authStore'
import { useUIStore } from '@/app/stores/uiStore'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, permission: null, exact: true },
  { label: 'Pacientes', to: '/patients', icon: Users, permission: 'patients:view', exact: false },
  { label: 'Empresas', to: '/companies', icon: Building2, permission: 'companies:view', exact: false },
  { label: 'Profesionales', to: '/workers', icon: HardHat, permission: 'workers:view', exact: true },
  { label: 'Horarios', to: '/workers/calendar', icon: CalendarRange, permission: 'workers:view', exact: false },
  { label: 'Citas individuales', to: '/appointments', icon: CalendarDays, permission: 'visits:view', exact: false },
  { label: 'Contratos', to: '/contracts', icon: FileText, permission: 'contracts:view', exact: false },
  { label: 'Programas', to: '/programs', icon: Briefcase, permission: 'contracts:view', exact: false },
  { label: 'Tipos de servicio', to: '/service-types', icon: Tag, permission: 'care_sessions:view', exact: false },
  { label: 'Usuarios', to: '/users', icon: UserCog, permission: 'users:view', exact: false },
  { label: 'Roles', to: '/roles', icon: ShieldCheck, permission: 'roles:view', exact: false },
  { label: 'Configuración', to: '/settings', icon: Settings, permission: null, exact: false },
]

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const location = useLocation()

  const visibleItems = navItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  )

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r bg-background transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-center border-b px-4">
        <Stethoscope className="h-6 w-6 shrink-0 text-primary" />
        {!collapsed && (
          <span className="ml-2 text-lg font-bold tracking-tight text-primary">AMAUR</span>
        )}
      </div>

      {/* Nav */}
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
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
