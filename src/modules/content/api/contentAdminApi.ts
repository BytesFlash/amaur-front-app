import { readDatabase, resetDatabase, snapshotFrom, updateDatabase } from '@/modules/content/lib/cmsStorage'
import { ensurePath, randomId, slugify } from '@/modules/content/lib/cmsUtils'
import type {
  BlogCategory,
  BlogPost,
  CmsSnapshot,
  FaqItem,
  LeadFormEntry,
  MediaAsset,
  SeoEntry,
  ServiceContent,
  SiteSettings,
  StaticPageContent,
  Testimonial,
} from '@/modules/content/types/cms'
import { apiClient } from '@/shared/api/client'

function upsertById<T extends { id: string }>(items: T[], next: T): T[] {
  const index = items.findIndex((item) => item.id === next.id)
  if (index === -1) {
    return [next, ...items]
  }

  const copy = [...items]
  copy[index] = next
  return copy
}

export const contentAdminApi = {
  async getSnapshot(): Promise<CmsSnapshot> {
    return snapshotFrom(readDatabase())
  },

  async resetAll(): Promise<CmsSnapshot> {
    return snapshotFrom(resetDatabase())
  },

  async savePost(input: Partial<BlogPost> & { title: string; excerpt: string }): Promise<BlogPost> {
    const now = new Date().toISOString()
    const id = input.id ?? randomId('post')
    const slug = slugify(input.slug ?? input.title)

    const post: BlogPost = {
      id,
      slug,
      title: input.title,
      excerpt: input.excerpt,
      categorySlug: input.categorySlug ?? 'bienestar-laboral',
      coverImage: input.coverImage ?? '/assets/brand/amaur-logo-dark.png',
      readingMinutes: input.readingMinutes ?? 6,
      status: input.status ?? 'draft',
      publishedAt: input.publishedAt ?? now,
      updatedAt: now,
      relatedServiceSlugs: input.relatedServiceSlugs ?? [],
      ctaLabel: input.ctaLabel ?? 'Contactar a AMAUR',
      ctaHref: input.ctaHref ?? '/contacto',
      sections:
        input.sections ?? [
          {
            heading: 'Contenido principal',
            paragraphs: ['Completa este bloque desde el CMS.'],
          },
        ],
      seo: {
        title: input.seo?.title ?? `${input.title} | Blog AMAUR`,
        description: input.seo?.description ?? input.excerpt,
        canonicalPath: ensurePath(input.seo?.canonicalPath ?? `/blog/${slug}`),
        ogTitle: input.seo?.ogTitle ?? input.title,
        ogDescription: input.seo?.ogDescription ?? input.excerpt,
        ogImage: input.seo?.ogImage ?? '/assets/brand/amaur-logo-dark.png',
        twitterCard: input.seo?.twitterCard ?? 'summary_large_image',
        noIndex: input.seo?.noIndex ?? false,
      },
    }

    updateDatabase((current) => ({
      ...current,
      posts: upsertById(current.posts, post),
    }))

    return post
  },

  async deletePost(postId: string): Promise<void> {
    updateDatabase((current) => ({
      ...current,
      posts: current.posts.filter((post) => post.id !== postId),
    }))
  },

  async saveCategory(input: Partial<BlogCategory> & { name: string }): Promise<BlogCategory> {
    const category: BlogCategory = {
      id: input.id ?? randomId('category'),
      name: input.name,
      slug: slugify(input.slug ?? input.name),
      description: input.description ?? 'Categoria de contenido AMAUR.',
    }

    updateDatabase((current) => ({
      ...current,
      categories: upsertById(current.categories, category),
    }))

    return category
  },

  async deleteCategory(categoryId: string): Promise<void> {
    updateDatabase((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== categoryId),
    }))
  },

  async saveService(input: ServiceContent): Promise<ServiceContent> {
    updateDatabase((current) => ({
      ...current,
      services: upsertById(current.services, {
        ...input,
        slug: slugify(input.slug),
        updatedAt: new Date().toISOString(),
        seo: {
          ...input.seo,
          canonicalPath: ensurePath(input.seo.canonicalPath),
        },
      }),
    }))

    return input
  },

  async savePage(input: StaticPageContent): Promise<StaticPageContent> {
    updateDatabase((current) => ({
      ...current,
      pages: upsertById(current.pages, {
        ...input,
        path: ensurePath(input.path),
        updatedAt: new Date().toISOString(),
        seo: {
          ...input.seo,
          canonicalPath: ensurePath(input.seo.canonicalPath),
        },
      }),
    }))

    return input
  },

  async saveFaq(input: Partial<FaqItem> & { pagePath: string; question: string; answer: string }): Promise<FaqItem> {
    const faq: FaqItem = {
      id: input.id ?? randomId('faq'),
      pagePath: ensurePath(input.pagePath),
      question: input.question,
      answer: input.answer,
      order: input.order ?? 1,
    }

    updateDatabase((current) => ({
      ...current,
      faqs: upsertById(current.faqs, faq),
    }))

    return faq
  },

  async deleteFaq(faqId: string): Promise<void> {
    updateDatabase((current) => ({
      ...current,
      faqs: current.faqs.filter((faq) => faq.id !== faqId),
    }))
  },

  async saveTestimonial(input: Partial<Testimonial> & { author: string; role: string; quote: string }): Promise<Testimonial> {
    const testimonial: Testimonial = {
      id: input.id ?? randomId('testimonial'),
      author: input.author,
      role: input.role,
      quote: input.quote,
      source: input.source ?? 'Formulario interno',
      rating: input.rating ?? 5,
    }

    updateDatabase((current) => ({
      ...current,
      testimonials: upsertById(current.testimonials, testimonial),
    }))

    return testimonial
  },

  async deleteTestimonial(id: string): Promise<void> {
    updateDatabase((current) => ({
      ...current,
      testimonials: current.testimonials.filter((item) => item.id !== id),
    }))
  },

  async saveSeoEntry(input: Partial<SeoEntry> & { path: string; seo: SeoEntry['seo'] }): Promise<SeoEntry> {
    const entry: SeoEntry = {
      id: input.id ?? randomId('seo'),
      path: ensurePath(input.path),
      seo: {
        ...input.seo,
        canonicalPath: ensurePath(input.seo.canonicalPath),
      },
    }

    updateDatabase((current) => ({
      ...current,
      seoEntries: upsertById(current.seoEntries, entry),
    }))

    return entry
  },

  async saveMediaAsset(input: Partial<MediaAsset> & { fileName: string; url: string; altText: string }): Promise<MediaAsset> {
    const media: MediaAsset = {
      id: input.id ?? randomId('media'),
      fileName: input.fileName,
      url: input.url,
      altText: input.altText,
      kind: input.kind ?? 'image',
      createdAt: input.createdAt ?? new Date().toISOString(),
    }

    updateDatabase((current) => ({
      ...current,
      mediaAssets: upsertById(current.mediaAssets, media),
    }))

    return media
  },

  async deleteMediaAsset(id: string): Promise<void> {
    updateDatabase((current) => ({
      ...current,
      mediaAssets: current.mediaAssets.filter((asset) => asset.id !== id),
    }))
  },

  async updateLeadStatus(id: string, status: LeadFormEntry['status']): Promise<void> {
    updateDatabase((current) => ({
      ...current,
      leads: current.leads.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
    }))
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    updateDatabase((current) => ({
      ...current,
      settings,
    }))

    return settings
  },

  async uploadMediaFile(file: File): Promise<{ url: string; fileName: string; mimeType: string; size: number }> {
    const form = new FormData()
    form.append('file', file)

    const { data } = await apiClient.post<{
      data: { url: string; fileName: string; mimeType: string; size: number }
    }>('/api/v1/content/media/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return data.data
  },
}
