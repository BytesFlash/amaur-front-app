import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { usePublicSnapshot, useServicePage } from '@/modules/content/hooks/usePublicContent'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { FaqList } from '@/modules/marketingSite/components/FaqList'
import { LeadFormCard } from '@/modules/marketingSite/components/LeadFormCard'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { breadcrumbSchema, faqSchema, localBusinessSchema } from '@/modules/marketingSite/lib/seo'
import { buildWhatsappLink } from '@/modules/marketingSite/config/siteConfig'
import { getServiceGalleryImages, getServiceHeroImage, getServiceImageAlt } from '@/modules/marketingSite/config/serviceImages'
import { NotFoundPage } from '@/shared/components/ui/NotFoundPage'
import { cn } from '@/shared/utils/cn'

const serviceVisuals: Record<
  string,
  {
    chip: string
    context: string
    accent: string
    surface: string
    icon: LucideIcon
  }
> = {
  kinesiologia: {
    chip: 'Rehabilitacion funcional',
    context: 'Atencion para personas',
    accent: 'from-sky-400/30 to-teal-400/15',
    surface: 'from-sky-100/45 via-white to-teal-100/20',
    icon: Sparkles,
  },
  'terapia-ocupacional': {
    chip: 'Autonomia en rutina',
    context: 'Atencion para personas',
    accent: 'from-emerald-400/30 to-cyan-400/15',
    surface: 'from-emerald-100/45 via-white to-cyan-100/20',
    icon: ShieldCheck,
  },
  telemedicina: {
    chip: 'Seguimiento remoto',
    context: 'Atencion para personas',
    accent: 'from-blue-400/30 to-sky-400/15',
    surface: 'from-blue-100/45 via-white to-cyan-100/20',
    icon: PlayCircle,
  },
  'masajes-descontracturantes': {
    chip: 'Descarga muscular',
    context: 'Atencion para personas',
    accent: 'from-amber-400/30 to-orange-400/15',
    surface: 'from-amber-100/45 via-white to-orange-100/20',
    icon: CircleDot,
  },
  'masajes-relajacion': {
    chip: 'Regulacion de estres',
    context: 'Atencion para personas',
    accent: 'from-lime-300/35 to-emerald-300/15',
    surface: 'from-lime-100/45 via-white to-emerald-100/20',
    icon: Sparkles,
  },
  'pausas-activas': {
    chip: 'Activacion de equipos',
    context: 'Enfoque para empresas',
    accent: 'from-emerald-400/30 to-lime-300/15',
    surface: 'from-emerald-100/45 via-white to-lime-100/20',
    icon: ShieldCheck,
  },
  'bienestar-empresarial': {
    chip: 'Prevencion organizacional',
    context: 'Enfoque para empresas',
    accent: 'from-violet-400/25 to-emerald-300/15',
    surface: 'from-violet-100/35 via-white to-emerald-100/20',
    icon: Sparkles,
  },
}

export function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const { data: service } = useServicePage(slug)
  const { data: snapshot } = usePublicSnapshot()

  if (!snapshot) {
    return null
  }

  if (!service) {
    return <NotFoundPage />
  }

  const relatedServices = snapshot.services.filter((item) => service.relatedServiceSlugs.includes(item.slug))
  const relatedPosts = snapshot.posts.filter(
    (item) => item.status === 'published' && service.relatedBlogSlugs.includes(item.slug),
  )
  const serviceFaqs = snapshot.faqs.filter(
    (faq) => service.faqIds.includes(faq.id) || faq.pagePath === `/servicios/${service.slug}`,
  )

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/servicios' },
    { label: service.name, href: `/servicios/${service.slug}` },
  ]

  const whatsappHref = buildWhatsappLink(
    `Hola AMAUR, quiero informacion sobre ${service.name}.`,
    snapshot.settings.whatsappNumber,
  )

  const visual = serviceVisuals[service.slug] ?? {
    chip: 'Atencion integral',
    context: 'Servicio AMAUR',
    accent: 'from-emerald-400/30 to-cyan-400/15',
    surface: 'from-emerald-100/45 via-white to-cyan-100/20',
    icon: Sparkles,
  }

  const HeroIcon = visual.icon
  const serviceHeroImage = getServiceHeroImage(service.slug, service.heroImage)
  const serviceImageAlt = getServiceImageAlt(service.slug, service.name)
  const galleryImages = getServiceGalleryImages(service.slug, service.heroImage).slice(0, 3)

  return (
    <>
      <SeoHead
        metadata={service.seo}
        schemas={[
          localBusinessSchema({ description: service.seo.description }),
          breadcrumbSchema(breadcrumbs),
          ...(serviceFaqs.length ? [faqSchema(serviceFaqs)] : []),
        ]}
      />

      <Breadcrumbs items={breadcrumbs} />

      <article className={cn('rounded-3xl border border-slate-200 bg-gradient-to-br p-8 shadow-sm sm:p-10', visual.surface)}>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                {visual.context}
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                {visual.chip}
              </span>
            </div>

            <h1 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight text-slate-950 sm:text-5xl">
              {service.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">{service.intro}</p>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Objetivo terapeutico</p>
              <p className="mt-1 text-sm leading-6 text-slate-800">{service.mainBenefit}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                WhatsApp directo
              </a>
              <Link
                to="/contacto"
                className="inline-flex items-center rounded-full border border-slate-300 bg-white/75 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
              >
                Formulario de contacto
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/76 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vista del servicio</p>
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-slate-900', visual.accent)}>
                <HeroIcon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 h-56 overflow-hidden rounded-2xl border border-slate-200">
              <img
                src={serviceHeroImage}
                alt={serviceImageAlt}
                className="h-full w-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>

            <div className="mt-4 space-y-2">
              {service.problems.slice(0, 3).map((problem) => (
                <div key={problem} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                  {problem}
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {galleryImages.map((imageUrl, index) => (
          <article key={`${service.slug}-gallery-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img
              src={imageUrl}
              alt={`${serviceImageAlt} - vista ${index + 1}`}
              className="h-52 w-full object-cover"
              loading="lazy"
            />
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Beneficios que puedes sentir</h2>
          <div className="mt-4 space-y-2">
            {service.benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm leading-6 text-slate-700">
                <CheckCircle2 className="mt-1 h-4 w-4 text-emerald-600" />
                {benefit}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Como trabajamos contigo</h2>
          <div className="mt-4 space-y-3">
            {service.howItWorks.map((step, index) => (
              <div key={step} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">Paso {index + 1}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">A quien va dirigido</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {service.audience.map((item) => (
            <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700">
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <FaqList title={`FAQ de ${service.name}`} faqs={serviceFaqs} />
        <LeadFormCard
          formType="person"
          title={`Solicita informacion de ${service.name}`}
          description="Cuentanos tu caso y te ayudamos a elegir el mejor siguiente paso."
        />
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Servicios relacionados</h2>
          <div className="mt-3 space-y-2">
            {relatedServices.map((related) => (
              <Link
                key={related.id}
                to={`/servicios/${related.slug}`}
                className="block rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                {related.name}
              </Link>
            ))}
            <Link to="/empresas" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-600">
              Ver propuesta para empresas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Articulos relacionados</h2>
          <div className="mt-3 space-y-2">
            {relatedPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="block rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                {post.title}
              </Link>
            ))}
            <Link to="/blog" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-600">
              Ver todos los articulos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>

      <div className="mt-10">
        <CtaBanner
          title={service.ctaTitle}
          description={service.ctaDescription}
          primaryLabel="Hablar por WhatsApp"
          primaryHref="/contacto"
          secondaryLabel="Volver a servicios"
          secondaryHref="/servicios"
        />
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Nota: reemplaza telefono, WhatsApp, cobertura, textos comerciales, imagenes y testimonios desde el modulo CMS de superadmin.
      </p>
    </>
  )
}
