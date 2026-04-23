import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  HeartHandshake,
  Sparkles,
  Stethoscope,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { SeoMetadata } from '@/modules/content/types/cms'
import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { FaqList } from '@/modules/marketingSite/components/FaqList'
import { SectionBrandHero } from '@/modules/marketingSite/components/SectionBrandHero'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { getServiceHeroImage, getServiceImageAlt } from '@/modules/marketingSite/config/serviceImages'
import { breadcrumbSchema, faqSchema, localBusinessSchema } from '@/modules/marketingSite/lib/seo'
import { cn } from '@/shared/utils/cn'

const serviceVisuals: Record<
  string,
  {
    icon: LucideIcon
    chip: string
    accent: string
  }
> = {
  kinesiologia: {
    icon: Activity,
    chip: 'Movilidad y rehabilitacion',
    accent: 'from-sky-500/30 to-teal-400/15',
  },
  'terapia-ocupacional': {
    icon: HeartHandshake,
    chip: 'Autonomia y rutina',
    accent: 'from-emerald-500/30 to-cyan-400/15',
  },
  telemedicina: {
    icon: Stethoscope,
    chip: 'Acompanamiento remoto',
    accent: 'from-blue-500/30 to-sky-400/15',
  },
  'masajes-descontracturantes': {
    icon: Waves,
    chip: 'Descarga muscular',
    accent: 'from-amber-500/30 to-orange-400/15',
  },
  'masajes-relajacion': {
    icon: Waves,
    chip: 'Regulacion del estres',
    accent: 'from-lime-400/35 to-emerald-300/15',
  },
  'pausas-activas': {
    icon: Sparkles,
    chip: 'Activacion de equipos',
    accent: 'from-emerald-500/30 to-lime-400/15',
  },
  'bienestar-empresarial': {
    icon: BriefcaseBusiness,
    chip: 'Prevencion organizacional',
    accent: 'from-cyan-500/30 to-emerald-300/15',
  },
}

const companyServiceSlugs = new Set(['pausas-activas', 'bienestar-empresarial'])

const fallbackServicesSeo: SeoMetadata = {
  title: 'Servicios AMAUR | Terapias y bienestar',
  description:
    'Kinesiologia, terapia ocupacional, telemedicina, masajes, pausas activas y bienestar empresarial.',
  canonicalPath: '/servicios',
  ogTitle: 'Servicios AMAUR',
  ogDescription: 'Conoce servicios para personas y equipos en AMAUR.',
  ogImage: '/assets/brand/amaur-logo-light.png',
  twitterCard: 'summary_large_image',
}

export function ServicesHubPage() {
  const { data, isLoading } = usePublicSnapshot()
  const [activeServiceSlug, setActiveServiceSlug] = useState('')

  const page = data?.pages.find((item) => item.path === '/servicios')
  const services = useMemo(
    () => data?.services.filter((service) => service.status === 'published') ?? [],
    [data],
  )
  const faqs = data?.faqs.filter((faq) => faq.pagePath === '/servicios') ?? []

  const personServices = useMemo(
    () => services.filter((service) => !companyServiceSlugs.has(service.slug)),
    [services],
  )
  const companyServices = useMemo(
    () => services.filter((service) => companyServiceSlugs.has(service.slug)),
    [services],
  )
  const serviceMap = useMemo(() => new Map(services.map((service) => [service.slug, service])), [services])

  useEffect(() => {
    const hasActive = services.some((service) => service.slug === activeServiceSlug)
    if (!hasActive && services.length > 0) {
      setActiveServiceSlug(services[0].slug)
    }
  }, [activeServiceSlug, services])

  const seo = page?.seo ?? fallbackServicesSeo
  const title = page?.heroTitle ?? 'Servicios terapeuticos y preventivos conectados entre si'
  const subtitle =
    page?.heroSubtitle ?? 'Explora cada servicio y encuentra el camino adecuado para tu caso o tu equipo.'

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/servicios' },
  ]

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">
        Cargando servicios...
      </section>
    )
  }

  if (!data) {
    return null
  }

  if (services.length === 0) {
    return (
      <>
        <SeoHead metadata={seo} schemas={[breadcrumbSchema(breadcrumbs)]} />
        <Breadcrumbs items={breadcrumbs} />
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl text-slate-900">
            Servicios
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Aun no hay servicios publicados desde el CMS. Puedes activarlos y apareceran aqui automaticamente.
          </p>
          <div className="mt-6">
            <Link
              to="/contacto"
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ir a contacto
            </Link>
          </div>
        </section>
      </>
    )
  }

  const activeService = services.find((service) => service.slug === activeServiceSlug) ?? services[0]
  const activeVisual = serviceVisuals[activeService.slug] ?? {
    icon: Sparkles,
    chip: 'Bienestar integral',
    accent: 'from-emerald-500/30 to-cyan-400/15',
  }
  const ActiveIcon = activeVisual.icon

  const activeRelatedServices = activeService.relatedServiceSlugs
    .map((slug) => serviceMap.get(slug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service))
    .slice(0, 3)

  return (
    <>
      <SeoHead
        metadata={seo}
        schemas={[
          localBusinessSchema({ description: seo.description }),
          breadcrumbSchema(breadcrumbs),
          ...(faqs.length ? [faqSchema(faqs)] : []),
        ]}
      />

      <Breadcrumbs items={breadcrumbs} />

      <SectionBrandHero
        sectionLabel="Servicios"
        title={title}
        description={subtitle}
        imageUrl={getServiceHeroImage(activeService.slug, activeService.heroImage)}
        imageAlt={getServiceImageAlt(activeService.slug, activeService.name)}
        chips={['Terapias personalizadas', 'Bienestar empresarial', 'Enfoque preventivo']}
        primaryAction={{ label: 'Explorar servicios', href: `/servicios/${activeService.slug}` }}
        secondaryAction={{ label: 'Hablar con AMAUR', href: '/contacto' }}
      />

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Ruta para personas</p>
            <h2 className="mt-1 text-3xl font-semibold text-slate-900">Atencion personal</h2>
          </div>
          <Link to="/contacto" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Necesito ayuda para elegir
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {personServices.map((service) => {
            const visual = serviceVisuals[service.slug] ?? activeVisual
            const Icon = visual.icon
            return (
              <article
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_32px_-26px_rgba(15,23,42,0.35)]"
              >
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={getServiceHeroImage(service.slug, service.heroImage)}
                    alt={getServiceImageAlt(service.slug, service.name)}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br', visual.accent)}>
                    <Icon className="h-4 w-4 text-slate-900" />
                  </div>
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    {visual.chip}
                  </span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">{service.name}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{service.shortDescription}</p>
                <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm leading-6 text-slate-700">
                  {service.mainBenefit}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveServiceSlug(service.slug)}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Ver resumen
                  </button>
                  <Link
                    to={`/servicios/${service.slug}`}
                    className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Explorar
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm sm:p-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Ruta para empresas</p>
            <h2 className="mt-1 text-3xl font-semibold">Programas corporativos</h2>
          </div>
          <Link to="/empresas" className="text-sm font-semibold text-emerald-200 hover:text-emerald-100">
            Ver pagina de empresas
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {companyServices.map((service) => {
            const visual = serviceVisuals[service.slug] ?? activeVisual
            const Icon = visual.icon
            return (
              <article key={service.id} className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
                <div className="mb-4 overflow-hidden rounded-xl border border-white/20">
                  <img
                    src={getServiceHeroImage(service.slug, service.heroImage)}
                    alt={getServiceImageAlt(service.slug, service.name)}
                    className="h-36 w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br', visual.accent)}>
                    <Icon className="h-4 w-4 text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-semibold">{service.name}</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-100">{service.intro}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {service.problems.slice(0, 2).map((problem) => (
                    <span key={problem} className="rounded-full border border-white/25 px-3 py-1 text-xs text-slate-100">
                      {problem}
                    </span>
                  ))}
                </div>
                <div className="mt-5">
                  <Link
                    to={`/servicios/${service.slug}`}
                    className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Explorar servicio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Explorador de servicios</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">Compara y decide</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Selecciona un servicio para ver su enfoque principal, problemas que aborda y accesos directos.
          </p>

          <div className="mt-5 space-y-2">
            {services.map((service) => {
              const active = service.slug === activeService.slug
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setActiveServiceSlug(service.slug)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-3 text-left text-sm transition',
                    active
                      ? 'border-emerald-300 bg-emerald-50 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  )}
                >
                  {service.name}
                </button>
              )
            })}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br', activeVisual.accent)}>
              <ActiveIcon className="h-4 w-4 text-slate-900" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">Servicio activo</p>
              <h3 className="text-3xl font-semibold text-slate-900">{activeService.name}</h3>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-700">{activeService.intro}</p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <img
              src={getServiceHeroImage(activeService.slug, activeService.heroImage)}
              alt={getServiceImageAlt(activeService.slug, activeService.name)}
              className="h-52 w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700">Beneficio principal</p>
            <p className="mt-1 text-sm leading-6 text-slate-800">{activeService.mainBenefit}</p>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {activeService.problems.slice(0, 2).map((problem) => (
              <div key={problem} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                {problem}
              </div>
            ))}
          </div>

          {!!activeRelatedServices.length && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Se complementa con</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeRelatedServices.map((related) => (
                  <Link
                    key={related.id}
                    to={`/servicios/${related.slug}`}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50"
                  >
                    {related.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/servicios/${activeService.slug}`}
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Ver detalle completo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/contacto"
              className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              Hablar con AMAUR
            </Link>
          </div>
        </article>
      </section>

      <div className="mt-10">
        <FaqList faqs={faqs} />
      </div>

      <div className="mt-10">
        <CtaBanner
          title="No sabes que servicio elegir?"
          description="Escribenos y te orientamos con una recomendacion inicial segun sintomas, objetivos y contexto."
          primaryLabel="Ir a contacto"
          primaryHref="/contacto"
          secondaryLabel="Ver empresas"
          secondaryHref="/empresas"
        />
      </div>
    </>
  )
}
