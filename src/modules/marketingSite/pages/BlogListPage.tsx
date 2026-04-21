import { Link, useSearchParams } from 'react-router-dom'
import { CalendarDays, Clock3 } from 'lucide-react'
import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { BlogCover } from '@/modules/marketingSite/components/BlogCover'
import { Breadcrumbs } from '@/modules/marketingSite/components/Breadcrumbs'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { breadcrumbSchema, localBusinessSchema } from '@/modules/marketingSite/lib/seo'

export function BlogListPage() {
  const { data } = usePublicSnapshot()
  const [searchParams] = useSearchParams()
  const rawCategory = searchParams.get('categoria')
  const activeCategory = rawCategory === 'ergonomia' ? 'bienestar-empresarial' : rawCategory

  if (!data) {
    return null
  }

  const page = data.pages.find((item) => item.path === '/blog')
  if (!page) {
    return null
  }

  const posts = data.posts
    .filter((post) => post.status === 'published')
    .filter((post) => (activeCategory ? post.categorySlug === activeCategory : true))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
  ]

  return (
    <>
      <SeoHead
        metadata={page.seo}
        schemas={[localBusinessSchema({ description: page.seo.description }), breadcrumbSchema(breadcrumbs)]}
      />

      <Breadcrumbs items={breadcrumbs} />

      <section className="rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#f7f4eb)] p-8 shadow-sm sm:p-10">
        <h1 className="font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl font-semibold text-slate-900 sm:text-5xl">
          {page.heroTitle}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{page.heroSubtitle}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            to="/blog"
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
              !activeCategory ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
            }`}
          >
            Todas
          </Link>
          {data.categories.map((category) => (
            <Link
              key={category.id}
              to={`/blog?categoria=${category.slug}`}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                activeCategory === category.slug ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        {posts.map((post) => {
          const category = data.categories.find((item) => item.slug === post.categorySlug)

          return (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="p-4">
                <BlogCover categorySlug={post.categorySlug} title={post.title} imageUrl={post.coverImage} compact />
              </div>
              <div className="px-6 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">{category?.name ?? 'Sin categoria'}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">
                <Link to={`/blog/${post.slug}`} className="hover:text-emerald-700">
                  {post.title}
                </Link>
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString('es-CL')}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {post.readingMinutes} min
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`} className="mt-5 inline-flex text-sm font-semibold text-slate-900 hover:text-emerald-700">
                  Leer articulo completo
                </Link>
              </div>
            </article>
          )
        })}
      </section>

      <div className="mt-10">
        <CtaBanner
          title="Contenido conectado con servicios"
          description="Cada articulo enlaza a servicios relacionados y llamadas de contacto para convertir trafico organico en oportunidades reales."
          primaryLabel="Ir a contacto"
          primaryHref="/contacto"
          secondaryLabel="Ver servicios"
          secondaryHref="/servicios"
        />
      </div>
    </>
  )
}
