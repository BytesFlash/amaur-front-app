import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { SectionBrandHero } from '@/modules/marketingSite/components/SectionBrandHero'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { breadcrumbSchema, localBusinessSchema, organizationSchema } from '@/modules/marketingSite/lib/seo'

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
        chips={['Criterio clinico', 'Cercania humana', 'Prevencion real']}
        primaryAction={{ label: 'Ver servicios', href: '/servicios' }}
        secondaryAction={{ label: 'Ir a empresas', href: '/empresas' }}
      />

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Nuestro enfoque</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Integracion entre salud fisica, funcionalidad y bienestar empresarial con decisiones basadas en evidencia y contexto real.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Para personas</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Acompanamiento terapeutico cercano para disminuir dolor, recuperar autonomia y sostener habitos saludables.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Para empresas</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Programas preventivos y terapeuticos adaptados a oficinas, operaciones, bodegas y contextos de alta exigencia.
          </p>
        </article>
      </section>

      <div className="mt-10">
        <CtaBanner
          title="Conoce nuestros servicios y casos de uso"
          description="Te mostramos como combinamos servicios para resolver objetivos clinicos y laborales de forma integral."
          primaryLabel="Ver servicios"
          primaryHref="/servicios"
          secondaryLabel="Pagina empresas"
          secondaryHref="/empresas"
        />
      </div>
    </>
  )
}
