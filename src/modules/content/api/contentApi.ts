import { readDatabase, snapshotFrom, updateDatabase } from '@/modules/content/lib/cmsStorage'
import { randomId } from '@/modules/content/lib/cmsUtils'
import type { BlogPost, CmsSnapshot, LeadFormEntry, ServiceContent, StaticPageContent } from '@/modules/content/types/cms'

const legacyServiceSlugMap: Record<string, string> = {
  'ergonomia-laboral': 'bienestar-empresarial',
}

const legacyPostSlugMap: Record<string, string> = {
  'checklist-ergonomico-en-bodegas': 'checklist-bienestar-empresarial-en-bodegas',
}

const legacyCategorySlugMap: Record<string, string> = {
  ergonomia: 'bienestar-empresarial',
}

function sortByPublishedDate(a: BlogPost, b: BlogPost): number {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
}

export const contentApi = {
  async getSnapshot(): Promise<CmsSnapshot> {
    return snapshotFrom(readDatabase())
  },

  async getPageByPath(path: string): Promise<StaticPageContent | null> {
    const database = readDatabase()
    return database.pages.find((page) => page.path === path) ?? null
  },

  async listServices(): Promise<ServiceContent[]> {
    const database = readDatabase()
    return database.services.filter((service) => service.status === 'published')
  },

  async getServiceBySlug(slug: string): Promise<ServiceContent | null> {
    const database = readDatabase()
    const normalizedSlug = legacyServiceSlugMap[slug] ?? slug
    return database.services.find((service) => service.slug === normalizedSlug && service.status === 'published') ?? null
  },

  async listPosts(categorySlug?: string): Promise<BlogPost[]> {
    const database = readDatabase()
    const posts = database.posts.filter((post) => post.status === 'published')
    const normalizedCategory = categorySlug ? legacyCategorySlugMap[categorySlug] ?? categorySlug : undefined
    const filtered = normalizedCategory ? posts.filter((post) => post.categorySlug === normalizedCategory) : posts
    return filtered.sort(sortByPublishedDate)
  },

  async getPostBySlug(slug: string, allowDraft = false): Promise<BlogPost | null> {
    const database = readDatabase()
    const normalizedSlug = legacyPostSlugMap[slug] ?? slug
    const post = database.posts.find((item) => item.slug === normalizedSlug)
    if (!post) {
      return null
    }

    if (post.status === 'draft' && !allowDraft) {
      return null
    }

    return post
  },

  async submitLead(input: Omit<LeadFormEntry, 'id' | 'createdAt' | 'status'>): Promise<LeadFormEntry> {
    const entry: LeadFormEntry = {
      ...input,
      id: randomId('lead'),
      createdAt: new Date().toISOString(),
      status: 'new',
    }

    updateDatabase((current) => ({
      ...current,
      leads: [entry, ...current.leads],
    }))

    return entry
  },
}
