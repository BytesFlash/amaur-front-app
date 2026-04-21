import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { FaqList } from '@/modules/marketingSite/components/FaqList'
import { LeadFormCard } from '@/modules/marketingSite/components/LeadFormCard'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { breadcrumbSchema, faqSchema, localBusinessSchema } from '@/modules/marketingSite/lib/seo'

const companyProblems = [
  'Estres sostenido y fatiga en equipos administrativos y operativos.',
  'Dolor muscular recurrente por carga fisica o postura.',
  'Ausentismo y baja energia por molestias no abordadas a tiempo.',
  'Falta de acciones preventivas adaptadas al tipo de trabajo.',
]

const amaurSolutions = [
  'Pausas activas por area y tipo de jornada.',
  'Bienestar empresarial para equipos administrativos y operativos.',
  'Jornadas de masajes de relajacion y descontracturantes.',
  'Telemedicina y apoyo preventivo para continuidad del cuidado.',
]

const workFormat = [
  'Diagnostico inicial de contexto y objetivos.',
  'Propuesta comercial por sede o area.',
  'Implementacion en terreno con seguimiento mensual.',
  'Reporte de participacion y recomendaciones.',
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

      <section className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white shadow-sm sm:p-10">
        <h1 className="text-4xl font-semibold leading-tight">{page.heroTitle}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">{page.heroSubtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/contacto" className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-100">
            Cotizar programa
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link to="/servicios/pausas-activas" className="inline-flex items-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10">
            Ver pausas activas
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Problemas frecuentes en empresas</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
            {companyProblems.map((problem) => (
              <li key={problem} className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                {problem}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Soluciones AMAUR</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
            {amaurSolutions.map((solution) => (
              <li key={solution} className="flex items-start gap-2">
                <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                {solution}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Beneficios para el equipo</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
            <li>• Reduccion de estres y molestias musculares en jornada.</li>
            <li>• Mejor experiencia de bienestar y percepcion de cuidado.</li>
            <li>• Apoyo preventivo para equipos administrativos y operativos.</li>
            <li>• Formatos adaptables a turnos, sedes y realidades laborales.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Formato de trabajo</h2>
          <ol className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
            {workFormat.map((item, index) => (
              <li key={item}>
                <span className="font-semibold text-slate-900">Paso {index + 1}:</span> {item}
              </li>
            ))}
          </ol>
        </article>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <LeadFormCard
          formType="company"
          title="CTA de cotizacion para empresas"
          description="Comparte cantidad de colaboradores, sedes y objetivo para preparar propuesta comercial."
        />
        <FaqList faqs={faqs} />
      </div>

      <div className="mt-10">
        <CtaBanner
          title="Activa tu plan de bienestar laboral"
          description="Integra pausas activas, bienestar empresarial y apoyo preventivo con una implementacion medible."
          primaryLabel="Solicitar cotizacion"
          primaryHref="/contacto"
          secondaryLabel="Ver blog de bienestar"
          secondaryHref="/blog?categoria=bienestar-laboral"
        />
      </div>
    </>
  )
}
