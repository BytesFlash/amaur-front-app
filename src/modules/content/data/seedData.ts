import { buildRouteMap as buildRoutes } from '@/modules/content/data/seedHelpers'
import { categoriesSeed } from '@/modules/content/data/categories'
import { faqsSeed } from '@/modules/content/data/faqs'
import { pagesSeed } from '@/modules/content/data/pages'
import { postsSeed } from '@/modules/content/data/posts'
import { servicesSeed } from '@/modules/content/data/services'
import { testimonialsSeed } from '@/modules/content/data/testimonials'
import type { CmsDatabase, MediaAsset, SeoEntry } from '@/modules/content/types/cms'

const updatedAt = new Date().toISOString()

const seoEntries: SeoEntry[] = [
  ...pagesSeed.map((page) => ({
    id: `seo-${page.path === '/' ? 'home' : page.path.replace(/\//g, '-')}`,
    path: page.path,
    seo: page.seo,
  })),
  ...servicesSeed.map((service) => ({
    id: `seo-service-${service.slug}`,
    path: `/servicios/${service.slug}`,
    seo: service.seo,
  })),
]

const mediaAssets: MediaAsset[] = [
  {
    id: 'media-logo-dark',
    fileName: 'amaur-logo-dark.png',
    url: '/assets/brand/amaur-logo-dark.png',
    altText: 'Logo principal de AMAUR en version oscura',
    kind: 'image',
    createdAt: updatedAt,
  },
  {
    id: 'media-logo-light',
    fileName: 'amaur-logo-light.png',
    url: '/assets/brand/amaur-logo-light.png',
    altText: 'Logo principal de AMAUR en version clara',
    kind: 'image',
    createdAt: updatedAt,
  },
  {
    id: 'media-about-team',
    fileName: 'equipo-amaur-salud.png',
    url: '/assets/about/equipo-amaur-salud.png',
    altText: 'Equipo AMAUR en sesion institucional',
    kind: 'image',
    createdAt: updatedAt,
  },
]

export const seedDatabase: CmsDatabase = {
  pages: pagesSeed,
  services: servicesSeed,
  posts: postsSeed,
  categories: categoriesSeed,
  faqs: faqsSeed,
  testimonials: testimonialsSeed,
  seoEntries,
  mediaAssets,
  leads: [],
  settings: {
    companyName: 'AMAUR',
    legalName: 'AMAUR SpA', // TODO: reemplazar razon social real.
    taxId: '76.000.000-0', // TODO: reemplazar RUT real.
    whatsappNumber: '56937544837', // TODO: reemplazar WhatsApp real (sin + ni espacios).
    phone: '+56 9 3754 4837', // TODO: reemplazar telefono real.
    instagramUrl: 'https://www.instagram.com/amaurchile/', // TODO: reemplazar Instagram real.
    linkedinUrl: 'https://www.linkedin.com/company/amaur-chile/', // TODO: reemplazar LinkedIn real.
    tiktokUrl: 'https://www.tiktok.com/@amaurchile', // TODO: reemplazar TikTok real.
    contactEmail: 'contacto@amaur.cl', // TODO: reemplazar correo real de contacto.
    salesEmail: 'empresas@amaur.cl', // TODO: reemplazar correo real comercial.
    address: 'Santiago, Chile', // TODO: reemplazar direccion real.
    city: 'Santiago', // TODO: reemplazar ciudad principal real.
    region: 'Region Metropolitana', // TODO: reemplazar region real.
    country: 'Chile',
    geoCoverage: 'Todo Santiago', // TODO: reemplazar cobertura geografica real.
    mapUrl: 'https://maps.google.com', // TODO: reemplazar URL real de mapa.
    defaultOgImage: '/assets/brand/amaur-logo-dark.png', // TODO: reemplazar imagen comercial OG final.
  },
  updatedAt,
}

export const buildRouteMap = buildRoutes
