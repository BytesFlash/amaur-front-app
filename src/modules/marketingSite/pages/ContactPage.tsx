import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { ContactLeadForm } from '@/modules/marketingSite/components/ContactLeadForm'
import { FaqList } from '@/modules/marketingSite/components/FaqList'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { breadcrumbSchema, faqSchema, localBusinessSchema } from '@/modules/marketingSite/lib/seo'
import { buildWhatsappLink, siteConfig } from '@/modules/marketingSite/config/siteConfig'

export function ContactPage() {
  const { data } = usePublicSnapshot()

  if (!data) {
    return null
  }

  const page = data.pages.find((item) => item.path === '/contacto')
  if (!page) {
    return null
  }

  const faqs = data.faqs.filter((faq) => faq.pagePath === '/contacto')
  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Contacto', href: '/contacto' },
  ]
  const whatsappHref = buildWhatsappLink(siteConfig.defaultWhatsappMessagePerson, data.settings.whatsappNumber)

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

      <section className="rounded-3xl border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_45%),linear-gradient(180deg,#ffffff,#f4f7f2)] p-8 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Contacto AMAUR</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">{page.heroTitle}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{page.heroSubtitle}</p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-emerald-600 px-5 py-2 font-semibold text-white hover:bg-emerald-500"
          >
            WhatsApp inmediato
          </a>
          <a
            href={data.settings.instagramUrl ?? siteConfig.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 bg-white/80 px-5 py-2 font-semibold text-slate-900 hover:bg-white"
          >
            Instagram
          </a>
          <a
            href={`mailto:${data.settings.contactEmail}`}
            className="rounded-full border border-slate-300 bg-white/80 px-5 py-2 font-semibold text-slate-900 hover:bg-white"
          >
            {data.settings.contactEmail}
          </a>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ContactLeadForm />

        <aside className="space-y-4">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Respuesta</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Te contactamos rapido</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Priorizamos cada solicitud y respondemos por WhatsApp o correo segun tu preferencia.
            </p>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-sm leading-7 text-slate-700">
              Si tu consulta es de empresa, envia idealmente cantidad de colaboradores, sedes y objetivo.
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Datos de contacto</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-900">Telefono:</span> {data.settings.phone}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Correo contacto:</span> {data.settings.contactEmail}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Correo empresas:</span> {data.settings.salesEmail}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Direccion:</span> {data.settings.address}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Cobertura:</span> {data.settings.geoCoverage}
              </p>
            </div>
          </article>
        </aside>
      </section>

      {!!faqs.length && (
        <div className="mt-8">
          <FaqList faqs={faqs} />
        </div>
      )}
    </>
  )
}
