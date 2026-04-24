import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ClipboardList,
  Handshake,
  LineChart,
  MapPin,
  Sparkles,
  Users,
  Waves,
  Zap,
} from 'lucide-react'
import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { FaqList } from '@/modules/marketingSite/components/FaqList'
import { LeadFormCard } from '@/modules/marketingSite/components/LeadFormCard'
import { SectionBrandHero } from '@/modules/marketingSite/components/SectionBrandHero'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { getServiceHeroImage, getServiceImageAlt } from '@/modules/marketingSite/config/serviceImages'
import { breadcrumbSchema, faqSchema, localBusinessSchema } from '@/modules/marketingSite/lib/seo'
import { cn } from '@/shared/utils/cn'

const impactStats = [
  { value: '200+', label: 'Colaboradores atendidos', note: 'en distintas sedes y rubros' },
  { value: '12+', label: 'Empresas activas', note: 'con programas vigentes' },
  { value: '4', label: 'Servicios integrados', note: 'adaptables a cada empresa' },
  { value: '95%', label: 'Satisfacción declarada', note: 'en seguimientos de programa' },
]

const painPoints = [
  {
    heading: 'El equipo llega cansado y nadie lo está midiendo',
    body: 'La fatiga acumulada no aparece en los informes de RRHH, pero se nota en el rendimiento, en el ánimo y en la cantidad de licencias.',
  },
  {
    heading: 'El dolor de espalda no es "cosa de la edad"',
    body: 'Puesto de trabajo mal configurado, jornadas largas frente a pantalla o carga física sin pausas: el origen es concreto y tiene solución.',
  },
  {
    heading: 'Las charlas de autocuidado no mueven la aguja',
    body: 'Sin intervención práctica en terreno, el bienestar sigue siendo una promesa en la pared. Tu equipo lo sabe, y lo evalúa.',
  },
  {
    heading: 'Cada sede tiene una realidad distinta',
    body: 'Una oficina en Santiago, una bodega en Quilicura y conductores en ruta no pueden recibir el mismo programa. Nosotros sabemos adaptarlo.',
  },
]

const programs = [
  {
    slug: 'pausas-activas',
    name: 'Pausas activas',
    description:
      'Rutinas breves guiadas para bajar la carga física y mental durante la jornada. Ideales para equipos administrativos y operativos.',
    href: '/servicios/pausas-activas',
    accent: 'from-emerald-400/25 to-cyan-300/10',
    icon: Sparkles,
  },
  {
    slug: 'masajes-descontracturantes',
    name: 'Masajes en empresa',
    description:
      'Jornadas de masajes descontracturantes y de relajación en terreno. Sin salir de la oficina, el equipo descansa de verdad.',
    href: '/servicios/masajes-descontracturantes',
    accent: 'from-amber-400/25 to-orange-300/10',
    icon: Waves,
  },
  {
    slug: 'bienestar-empresarial',
    name: 'Bienestar empresarial',
    description:
      'Programas preventivos completos con diagnóstico, implementación y seguimiento mensual adaptados a la realidad de tu empresa.',
    href: '/servicios/bienestar-empresarial',
    accent: 'from-violet-400/20 to-emerald-300/10',
    icon: Users,
  },
]

const workSteps = [
  {
    number: '01',
    icon: ClipboardList,
    title: 'Diagnóstico de contexto',
    body: 'Conversamos sobre el tipo de trabajo, cantidad de personas, sedes y objetivos. Sin formularios de 40 preguntas.',
  },
  {
    number: '02',
    icon: Handshake,
    title: 'Propuesta a medida',
    body: 'Diseñamos una propuesta comercial concreta, con servicios, frecuencia y formato adaptado a tu empresa.',
  },
  {
    number: '03',
    icon: MapPin,
    title: 'Implementación en terreno',
    body: 'Llegamos donde está tu equipo. Oficina, bodega, planta, terreno. Nos adaptamos al ritmo de la operación.',
  },
  {
    number: '04',
    icon: LineChart,
    title: 'Seguimiento y ajuste',
    body: 'Reporte de participación, retroalimentación del equipo y ajuste del programa según los resultados.',
  },
]

export function CompaniesPage() {
  const { data } = usePublicSnapshot()

  if (!data) {
    return null
  }

  const page = data.pages.find((item) => item.path === '/empresas')
  if (!page) {
    return null
  }

  const faqs = data.faqs.filter((faq) => faq.pagePath === '/empresas')
  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Empresas', href: '/empresas' },
  ]

  return (
    <>
      <SeoHead
        metadata={page.seo}
        schemas={[
          localBusinessSchema({ description: page.seo.description, areaServed: data.settings.geoCoverage }),
          breadcrumbSchema(breadcrumbs),
          ...(faqs.length ? [faqSchema(faqs)] : []),
        ]}
      />

      <Breadcrumbs items={breadcrumbs} />

      <SectionBrandHero
        sectionLabel="Empresas"
        title={page.heroTitle}
        description={page.heroSubtitle}
        imageUrl={getServiceHeroImage('bienestar-empresarial')}
        imageAlt={getServiceImageAlt('bienestar-empresarial', 'Bienestar empresarial')}
        chips={['Pausas activas', 'Bienestar empresarial', 'Programas preventivos']}
        primaryAction={{ label: 'Cotizar programa', href: '/contacto' }}
        secondaryAction={{ label: 'Ver pausas activas', href: '/servicios/pausas-activas' }}
        tone="dark"
      />

      {/* Impacto en cifras */}
      <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {impactStats.map((stat) => (
          <div
            key={stat.value}
            className="rounded-2xl border border-emerald-200/60 bg-[linear-gradient(180deg,#f0faf5,#e8f5ee)] px-5 py-6 text-center"
          >
            <p className="font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl font-semibold text-emerald-700">
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{stat.label}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
          </div>
        ))}
      </section>

      {/* El problema real */}
      <section className="mt-8 overflow-hidden rounded-[2.2rem] border border-slate-900/10 bg-slate-950 shadow-[0_40px_110px_-60px_rgba(15,23,42,0.85)]">
        <div className="grid lg:grid-cols-[1fr_1fr]">
          {/* Imagen */}
          <div className="relative min-h-[320px] overflow-hidden lg:min-h-[520px]">
            <img
              src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="Trabajador con fatiga y dolor de espalda en oficina"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.55))] lg:bg-[linear-gradient(90deg,rgba(2,6,23,0.0),rgba(2,6,23,0.5))]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-black/35 p-4 backdrop-blur lg:hidden">
              <p className="text-sm font-semibold text-white">El costo invisible del malestar</p>
              <p className="mt-1 text-xs text-white/75">Ausentismo, baja energía y rotación tienen un origen que sí se puede intervenir.</p>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex flex-col justify-center p-8 text-white sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">El problema real</p>
            <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl leading-tight sm:text-4xl">
              Lo que no aparece en los informes pero todos sienten.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Muchos equipos cargan con fatiga, dolor muscular y estrés sostenido sin que nadie lo aborde. Aquí están los
              patrones más frecuentes que vemos en terreno.
            </p>

            <div className="mt-7 space-y-5">
              {painPoints.map((point) => (
                <div key={point.heading} className="flex gap-4">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Zap className="h-3.5 w-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{point.heading}</p>
                    <p className="mt-1 text-xs leading-6 text-white/68">{point.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Programas para empresas */}
      <section className="mt-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Programas</p>
          <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl text-slate-950 sm:text-4xl">
            Tres formas de cuidar a tu equipo.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            Podemos implementar uno solo o combinarlos según la realidad de tu empresa. Todo parte por una conversación.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {programs.map((program) => {
            const Icon = program.icon
            const heroImage = getServiceHeroImage(program.slug)
            const heroAlt = getServiceImageAlt(program.slug, program.name)

            return (
              <article
                key={program.slug}
                className="group overflow-hidden rounded-[1.8rem] border border-slate-900/10 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={heroImage}
                    alt={heroAlt}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.38))]" />
                  <div className={cn('absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br shadow-md', program.accent)}>
                    <Icon className="h-4 w-4 text-slate-800" />
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-950">{program.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{program.description}</p>
                  <Link
                    to={program.href}
                    className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-600"
                  >
                    Ver servicio completo
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Cómo trabajamos */}
      <section className="mt-8 rounded-[2.2rem] border border-slate-200 bg-[linear-gradient(180deg,#f9fbf8,#f2f5ed)] p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Proceso</p>
        <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl text-slate-950 sm:text-4xl">
          Cuatro pasos, sin rodeos.
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
          Desde la primera llamada hasta el reporte de resultados. Sin burocracia innecesaria.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {workSteps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50">
                    <Icon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <span className="font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl font-semibold text-slate-100 select-none">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Imagen full con frase */}
      <section className="relative mt-8 overflow-hidden rounded-[2.2rem]">
        <img
          src={getServiceHeroImage('pausas-activas')}
          alt="Equipo haciendo pausa activa en oficina"
          className="h-72 w-full object-cover sm:h-80"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.22),rgba(2,6,23,0.68))]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <p className="max-w-2xl font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl font-semibold leading-snug text-white sm:text-4xl">
            "El bienestar del equipo no es un gasto. Es lo que sostiene la operación."
          </p>
          <p className="mt-4 text-sm text-white/70">Equipo AMAUR</p>
        </div>
      </section>

      {/* Formulario + FAQs */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LeadFormCard
          formType="company"
          title="Cotiza tu programa de bienestar"
          description="Cuéntanos cuántos colaboradores tienen, en qué tipo de jornada trabajan y cuál es el principal desafío. En 24 horas tienes una propuesta."
        />
        <FaqList faqs={faqs} />
      </div>

      <div className="mt-10">
        <CtaBanner
          title="Activa tu plan de bienestar laboral"
          description="Integra pausas activas, bienestar empresarial y apoyo preventivo con una implementación medible."
          primaryLabel="Solicitar cotización"
          primaryHref="/contacto"
          secondaryLabel="Ver blog de bienestar"
          secondaryHref="/blog?categoria=bienestar-laboral"
        />
      </div>
    </>
  )
}
