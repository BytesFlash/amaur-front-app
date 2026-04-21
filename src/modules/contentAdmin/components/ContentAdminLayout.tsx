import { NavLink, Outlet } from 'react-router-dom'
import { contentAdminModules } from '@/modules/contentAdmin/lib/contentAdminNav'
import { cn } from '@/shared/utils/cn'

export function ContentAdminLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">CMS de contenidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona blog, servicios, FAQ, SEO, media y leads desde un solo panel.
        </p>
      </div>

      <nav className="overflow-x-auto rounded-xl border bg-card p-2">
        <ul className="flex min-w-max gap-1">
          {contentAdminModules.map((module) => (
            <li key={module.href}>
              <NavLink
                to={module.href}
                end={module.href === '/app/content'}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                    isActive && 'bg-primary/10 text-primary',
                  )
                }
              >
                {module.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Outlet />
    </div>
  )
}
