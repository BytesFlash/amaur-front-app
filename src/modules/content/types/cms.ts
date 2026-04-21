export type ContentStatus = 'draft' | 'published'

export interface SeoMetadata {
  title: string
  description: string
  canonicalPath: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterCard?: 'summary' | 'summary_large_image'
  noIndex?: boolean
}

export interface BreadcrumbItem {
  label: string
  href: string
}

export interface FaqItem {
  id: string
  pagePath: string
  question: string
  answer: string
  order: number
}

export interface Testimonial {
  id: string
  author: string
  role: string
  quote: string
  source?: string
  rating: number
}

export interface ServiceContent {
  id: string
  slug: string
  name: string
  shortDescription: string
  mainBenefit: string
  intro: string
  heroImage?: string
  problems: string[]
  benefits: string[]
  howItWorks: string[]
  audience: string[]
  relatedServiceSlugs: string[]
  relatedBlogSlugs: string[]
  ctaTitle: string
  ctaDescription: string
  faqIds: string[]
  status: ContentStatus
  seo: SeoMetadata
  updatedAt: string
}

export interface BlogCategory {
  id: string
  slug: string
  name: string
  description: string
}

export interface BlogPostSection {
  heading: string
  paragraphs: string[]
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  categorySlug: string
  coverImage?: string
  readingMinutes: number
  status: ContentStatus
  publishedAt: string
  updatedAt: string
  relatedServiceSlugs: string[]
  ctaLabel: string
  ctaHref: string
  sections: BlogPostSection[]
  seo: SeoMetadata
}

export interface StaticPageContent {
  id: string
  path: string
  title: string
  description: string
  heroTitle: string
  heroSubtitle: string
  bodySections: Array<{
    id: string
    title: string
    content: string[]
  }>
  seo: SeoMetadata
  updatedAt: string
}

export interface MediaAsset {
  id: string
  fileName: string
  url: string
  altText: string
  kind: 'image' | 'document'
  createdAt: string
}

export interface LeadFormEntry {
  id: string
  formType: 'person' | 'company'
  fullName: string
  email: string
  phone: string
  companyName?: string
  message: string
  sourcePath: string
  createdAt: string
  status: 'new' | 'contacted' | 'closed'
}

export interface SeoEntry {
  id: string
  path: string
  seo: SeoMetadata
}

export interface SiteSettings {
  companyName: string
  legalName: string
  taxId: string
  whatsappNumber: string
  phone: string
  instagramUrl?: string
  linkedinUrl?: string
  tiktokUrl?: string
  contactEmail: string
  salesEmail: string
  address: string
  city: string
  region: string
  country: string
  geoCoverage: string
  mapUrl: string
  defaultOgImage: string
}

export interface CmsDatabase {
  pages: StaticPageContent[]
  services: ServiceContent[]
  posts: BlogPost[]
  categories: BlogCategory[]
  faqs: FaqItem[]
  testimonials: Testimonial[]
  seoEntries: SeoEntry[]
  mediaAssets: MediaAsset[]
  leads: LeadFormEntry[]
  settings: SiteSettings
  updatedAt: string
}

export interface CmsSnapshot extends CmsDatabase {
  routeMap: string[]
}
