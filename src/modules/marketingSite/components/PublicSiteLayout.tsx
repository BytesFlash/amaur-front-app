import { useMemo, useState, useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X, ChevronDown, LogIn } from 'lucide-react'
import { useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { buildWhatsappLink, siteConfig } from '@/modules/marketingSite/config/siteConfig'
import { WhatsAppFloatingButton } from '@/modules/marketingSite/components/WhatsAppFloatingButton'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'

const mainNavigation = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Empresas', href: '/empresas' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contacto', href: '/contacto' },
]

export function PublicSiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { data } = useCmsSnapshot()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const services = useMemo(
    () => data?.services.filter((service) => service.status === 'published') ?? [],
    [data?.services],
  )
  const settings = data?.settings

  const whatsappLink = buildWhatsappLink(siteConfig.defaultWhatsappMessagePerson, settings?.whatsappNumber)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.14),_transparent_32%),linear-gradient(180deg,_#f8f5eb_0%,_#f5f8f2_40%,_#fbfaf5_100%)] text-slate-900">
      <header
        className={cn(
          'sticky top-0 z-40 border-b border-slate-900/10 backdrop-blur-xl transition-colors duration-200',
          scrolled ? 'bg-[#f8f5eb]' : 'bg-[#f8f5eb]/75',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center" aria-label="Ir al inicio de AMAUR">
            <img
              src="/assets/brand/amaur-logo-dark.png"
              alt="Logo AMAUR"
              className="h-12 w-12 object-contain"
              fetchPriority="high"
            />
            <span className="sr-only">AMAUR</span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {mainNavigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn('text-sm font-medium text-slate-600 transition-colors hover:text-slate-950', isActive && 'text-slate-900')
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setServicesOpen((current) => !current)}
                className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
              >
                Servicios especificos
                <ChevronDown className="h-4 w-4" />
              </button>

              {servicesOpen && (
                <div className="absolute right-0 top-9 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.5)]">
                  <ul className="space-y-1">
                    {services.map((service) => (
                      <li key={service.id}>
                        <Link
                          to={`/servicios/${service.slug}`}
                          className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                          onClick={() => setServicesOpen(false)}
                        >
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button asChild variant="ghost" className="rounded-full px-5 text-slate-700 hover:bg-white/70">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Acceso interno
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
              <Link to="/contacto">Portal pacientes y equipo</Link>
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-slate-700 lg:hidden"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-900/10 bg-[#f8f5eb] lg:hidden">
            <div className="mx-auto max-w-7xl space-y-2 px-4 py-4 sm:px-6">
              {mainNavigation.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn('block rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-white/80', isActive && 'bg-white text-slate-900')
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Servicios</p>
                <div className="mt-2 grid gap-1">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      to={`/servicios/${service.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-white/80"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto min-h-[65vh] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-900/10 bg-[#f8f5eb]/90">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-sm sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <h3 className="font-semibold text-slate-900">AMAUR</h3>
            <p className="mt-2 text-slate-600">Salud y bienestar integral para personas y equipos.</p>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Contacto</h3>
            <p className="mt-2 text-slate-600">{settings?.phone ?? siteConfig.phone}</p>
            <p className="text-slate-600">{settings?.contactEmail ?? siteConfig.contactEmail}</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex text-emerald-700 hover:text-emerald-600">
                WhatsApp
              </a>
              <a
                href={settings?.instagramUrl ?? siteConfig.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-slate-700 hover:text-slate-900"
              >
                Instagram
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Cobertura</h3>
            <p className="mt-2 text-slate-600">{settings?.address ?? siteConfig.address}</p>
            <p className="text-slate-600">{settings?.geoCoverage ?? siteConfig.coverage}</p>
          </div>
        </div>
      </footer>

      <WhatsAppFloatingButton message={siteConfig.defaultWhatsappMessagePerson} />
    </div>
  )
}
