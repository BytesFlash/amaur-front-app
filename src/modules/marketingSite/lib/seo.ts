import { siteConfig } from '@/modules/marketingSite/config/siteConfig'
import type { BreadcrumbItem, FaqItem, SeoMetadata } from '@/modules/content/types/cms'

export interface JsonLdSchema {
  '@context': 'https://schema.org'
  '@type': string
  [key: string]: unknown
}

export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${siteConfig.siteUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export function resolveSeo(meta: SeoMetadata): SeoMetadata {
  return {
    ...meta,
    canonicalPath: meta.canonicalPath.startsWith('http') ? meta.canonicalPath : absoluteUrl(meta.canonicalPath),
    ogImage: meta.ogImage ? absoluteUrl(meta.ogImage) : absoluteUrl(siteConfig.defaultOgImage),
    twitterCard: meta.twitterCard ?? 'summary_large_image',
  }
}

export function organizationSchema() {
  const socialProfiles = [siteConfig.instagramUrl, siteConfig.linkedinUrl, siteConfig.tiktokUrl].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AMAUR',
    url: siteConfig.siteUrl,
    logo: absoluteUrl('/assets/brand/amaur-logo-dark.png'),
    email: siteConfig.contactEmail,
    telephone: siteConfig.phone,
    sameAs: socialProfiles,
  } satisfies JsonLdSchema
}

export function localBusinessSchema(options: {
  description: string
  areaServed?: string
  sameAs?: string[]
}) {
  const socialProfiles = [siteConfig.instagramUrl, siteConfig.linkedinUrl, siteConfig.tiktokUrl].filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'AMAUR',
    image: absoluteUrl('/assets/brand/amaur-logo-dark.png'),
    url: siteConfig.siteUrl,
    description: options.description,
    telephone: siteConfig.phone,
    email: siteConfig.contactEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address,
      addressLocality: 'Santiago',
      addressRegion: 'Region Metropolitana',
      addressCountry: 'CL',
    },
    areaServed: options.areaServed ?? siteConfig.coverage,
    sameAs: options.sameAs ?? socialProfiles,
  } satisfies JsonLdSchema
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  }
}

export function faqSchema(faqs: FaqItem[]): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
