import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useBlogPost, usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { BlogCover } from '@/modules/marketingSite/components/BlogCover'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { breadcrumbSchema, localBusinessSchema } from '@/modules/marketingSite/lib/seo'
import { NotFoundPage } from '@/shared/components/ui/NotFoundPage'

export function BlogDetailPage() {
  const { slug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const preview = searchParams.get('preview') === '1'
  const { data: post } = useBlogPost(slug, preview)
  const { data: snapshot } = usePublicSnapshot()

  if (!snapshot) {
    return null
  }

  if (!post) {
    return <NotFoundPage />
  }

  const category = snapshot.categories.find((item) => item.slug === post.categorySlug)
  const relatedServices = snapshot.services.filter((service) => post.relatedServiceSlugs.includes(service.slug))

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title, href: `/blog/${post.slug}` },
  ]
  const metadata =
    preview && post.status === 'draft'
      ? {
          ...post.seo,
          noIndex: true,
        }
      : post.seo

  return (
    <>
      <SeoHead
        metadata={metadata}
        schemas={[localBusinessSchema({ description: post.seo.description }), breadcrumbSchema(breadcrumbs)]}
      />

      <Breadcrumbs items={breadcrumbs} />

      {preview && (
        <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Modo preview activo: este contenido puede estar en borrador.
        </div>
      )}

      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6">
          <BlogCover categorySlug={post.categorySlug} title={post.title} imageUrl={post.coverImage} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{category?.name ?? 'Blog AMAUR'}</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-slate-900">{post.title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{post.excerpt}</p>

        <div className="mt-8 space-y-8">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-semibold text-slate-900">{section.heading}</h2>
              <div className="mt-3 space-y-4 text-sm leading-8 text-slate-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Servicios relacionados</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedServices.map((service) => (
              <Link
                key={service.id}
                to={`/servicios/${service.slug}`}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 hover:bg-white"
              >
                {service.name}
              </Link>
            ))}
          </div>
        </div>
      </article>

      <div className="mt-10">
        <CtaBanner
          title="Convierte lectura en accion"
          description="Si necesitas orientacion profesional, agenda por formulario o WhatsApp y te guiamos en el siguiente paso."
          primaryLabel={post.ctaLabel}
          primaryHref={post.ctaHref}
          secondaryLabel="Volver al blog"
          secondaryHref="/blog"
        />
      </div>
    </>
  )
}
