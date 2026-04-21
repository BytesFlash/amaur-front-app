import type { CmsDatabase } from '@/modules/content/types/cms'

export function buildRouteMap(database: CmsDatabase): string[] {
  const serviceRoutes = database.services.map((service) => `/servicios/${service.slug}`)
  const postRoutes = database.posts
    .filter((post) => post.status === 'published')
    .map((post) => `/blog/${post.slug}`)

  return ['/', '/nosotros', '/servicios', '/empresas', '/blog', '/contacto', ...serviceRoutes, ...postRoutes]
}
