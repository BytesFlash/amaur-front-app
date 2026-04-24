import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Microscope, ShieldCheck, Users } from 'lucide-react'
import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { SectionBrandHero } from '@/modules/marketingSite/components/SectionBrandHero'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { breadcrumbSchema, localBusinessSchema, organizationSchema } from '@/modules/marketingSite/lib/seo'
import { getServiceHeroImage, getServiceImageAlt } from '@/modules/marketingSite/config/serviceImages'

const values = [
  {
    icon: Microscope,
    title: 'Evidencia clínica',
    body: 'Cada intervención tiene respaldo técnico. No trabajamos con intuición ni con protocolos genéricos copiados de internet.',
    accent: 'bg-sky-50 border-sky-200',
    iconAccent: 'bg-sky-100 text-sky-700',
  },
  {
    icon: Heart,
    title: 'Cercanía real',
    body: 'Llegamos a donde está la persona. A la empresa, a la consulta, a la videollamada. Sin barreras de distancia ni de agenda.',
    accent: 'bg-rose-50 border-rose-200',
    iconAccent: 'bg-rose-100 text-rose-700',
  },
  {
    icon: Users,
    title: 'Enfoque integral',
    body: 'Combinamos kinesiología, terapia ocupacional, masajes y telemedicina porque el bienestar no vive en un solo servicio.',
    accent: 'bg-emerald-50 border-emerald-200',
    iconAccent: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: ShieldCheck,
    title: 'Prevención sobre reacción',
    body: 'Preferimos actuar antes de que el dolor sea el problema. Así cuidamos mejor y el impacto dura más.',
    accent: 'bg-violet-50 border-violet-200',
    iconAccent: 'bg-violet-100 text-violet-700',
  },
]

const differentiators = [
  {
    label: 'Adaptamos el formato a tu realidad',
    body: 'Oficina, bodega, terreno o domicilio: diseñamos cada programa según el contexto, no al revés.',
    image: 'https://images.pexels.com/photos/6339343/pexels-photo-6339343.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'Profesional AMAUR en terreno con equipo de trabajo',
  },
  {
    label: 'Un equipo multidisciplinario',
    body: 'Kinesiólogos, terapeutas ocupacionales y profesionales en masoterapia trabajando coordinados bajo el mismo criterio clínico.',
    image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'Equipo de salud AMAUR en sesión clínica',
  },
  {
    label: 'Sin intermediarios, sin burocracia',
    body: 'Hablas directamente con quien va a atenderte. Sin call center, sin derivaciones eternas ni formularios de 40 campos.',
    image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'Kinesiólogo en atención personalizada con paciente',
  },
  {
    label: 'Resultados que se pueden medir',
    body: 'Para empresas entregamos reportes de participación. Para personas, seguimiento de avance sesión a sesión.',
    image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=900',
    imageAlt: 'Seguimiento clínico y medición de resultados',
  },
]

export function AboutPage() {
  const { data } = usePublicSnapshot()
  if (!data) {
    return null
  }

  const page = data.pages.find((item) => item.path === '/nosotros')
  if (!page) {
    return null
  }

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Nosotros', href: '/nosotros' },
  ]

  return (
    <>
      <SeoHead
        metadata={page.seo}
        schemas={[organizationSchema(), localBusinessSchema({ description: page.seo.description }), breadcrumbSchema(breadcrumbs)]}
      />

      <Breadcrumbs items={breadcrumbs} />

      <SectionBrandHero
        sectionLabel="Nosotros"
        title={page.heroTitle}
        description={page.heroSubtitle}
        imageUrl={page.heroImage ?? '/assets/about/equipo-amaur-salud.png'}
        imageAlt={page.heroImageAlt ?? 'Equipo AMAUR en sesion institucional'}
        chips={['Criterio clínico', 'Cercanía humana', 'Prevención real']}
        primaryAction={{ label: 'Ver servicios', href: '/servicios' }}
        secondaryAction={{ label: 'Ir a empresas', href: '/empresas' }}
      />

      {/* Nuestra historia */}
      <section className="mt-8 overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[320px] overflow-hidden lg:min-h-[500px]">
            <img
              src="/assets/about/dolor-hombro.png"
              alt="Atención clínica AMAUR en sesión de salud y bienestar"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.36))]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/80 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">AMAUR Salud</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">Bienestar integral para personas y equipos de trabajo.</p>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Quiénes somos</p>
            <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl leading-tight text-slate-950 sm:text-4xl">
              Nació de una pregunta simple: ¿por qué esperar a que duela?
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
              <p>
                AMAUR surge de la convicción de que la salud no debería ser reactiva. Vimos repetidamente cómo personas y
                equipos llegaban a la consulta con problemas que podían haberse prevenido semanas o meses antes.
              </p>
              <p>
                Por eso construimos un modelo que integra kinesiología, terapia ocupacional, masoterapia y telemedicina bajo
                un mismo criterio clínico: atender bien, adaptar el formato a quien lo necesita y sostener los resultados en
                el tiempo.
              </p>
              <p>
                Trabajamos con personas que quieren recuperar movilidad, bajar el dolor y volver a moverse con tranquilidad.
                Y trabajamos con empresas que entienden que el bienestar de su equipo no es un gasto, es lo que sostiene la
                operación.
              </p>
            </div>
            <Link
              to="/servicios"
              className="mt-6 inline-flex items-center text-sm font-semibold text-slate-900 hover:text-emerald-700"
            >
              Conocer todos los servicios
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nuestros valores */}
      <section className="mt-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Valores</p>
          <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl text-slate-950 sm:text-4xl">
            Lo que guía cada decisión clínica.
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <article
                key={value.title}
                className={`rounded-2xl border p-5 ${value.accent}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${value.iconAccent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{value.body}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* Lo que nos diferencia */}
      <section className="mt-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Diferenciadores</p>
          <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl text-slate-950 sm:text-4xl">
            Por qué elegir AMAUR.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
            No somos una clínica tradicional ni una empresa de eventos de bienestar. Somos algo distinto.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {differentiators.map((item) => (
            <article
              key={item.label}
              className="group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.imageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.42))]" />
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-slate-950">{item.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Para quién trabajamos */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative h-52 overflow-hidden">
            <img
              src={getServiceHeroImage('kinesiologia')}
              alt={getServiceImageAlt('kinesiologia', 'Kinesiología')}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06),rgba(15,23,42,0.44))]" />
            <div className="absolute bottom-4 left-4">
              <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                Personas
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-slate-950">Para ti</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Si tienes dolor, limitación de movimiento, quieres prevenir o simplemente recuperar bienestar físico, nuestros
              servicios están diseñados para acompañarte en ese proceso de forma cercana y con criterio clínico.
            </p>
            <Link to="/servicios" className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-600">
              Ver servicios personales
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border border-slate-900/10 bg-slate-950 shadow-sm">
          <div className="relative h-52 overflow-hidden">
            <img
              src={getServiceHeroImage('bienestar-empresarial')}
              alt={getServiceImageAlt('bienestar-empresarial', 'Bienestar empresarial')}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08),rgba(2,6,23,0.52))]" />
            <div className="absolute bottom-4 left-4">
              <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                Empresas
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white">Para tu equipo</h3>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Si tienes un equipo de trabajo y quieres implementar bienestar real, con seguimiento y adaptado a cada sede o
              área, tenemos un programa que funciona y los resultados para demostrarlo.
            </p>
            <Link to="/empresas" className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300">
              Ver propuesta empresas
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-10">
        <CtaBanner
          title="Conoce nuestros servicios y casos de uso"
          description="Te mostramos cómo combinamos servicios para resolver objetivos clínicos y laborales de forma integral."
          primaryLabel="Ver servicios"
          primaryHref="/servicios"
          secondaryLabel="Página empresas"
          secondaryHref="/empresas"
        />
      </div>
    </>
  )
}
