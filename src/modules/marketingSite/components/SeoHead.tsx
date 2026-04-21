import { useEffect } from 'react'
import type { SeoMetadata } from '@/modules/content/types/cms'
import { resolveSeo } from '@/modules/marketingSite/lib/seo'

interface SeoHeadProps {
  metadata: SeoMetadata
  schemas?: Array<Record<string, unknown>>
}

const managedMetaNames = [
  'description',
  'robots',
  'og:title',
  'og:description',
  'og:type',
  'og:url',
  'og:image',
  'twitter:card',
  'twitter:title',
  'twitter:description',
  'twitter:image',
]

function upsertMeta(name: string, content: string) {
  const selector = name.startsWith('og:') ? `meta[property="${name}"]` : `meta[name="${name}"]`
  const element = document.head.querySelector(selector) ?? document.createElement('meta')

  if (name.startsWith('og:')) {
    element.setAttribute('property', name)
  } else {
    element.setAttribute('name', name)
  }

  element.setAttribute('content', content)

  if (!element.parentNode) {
    document.head.appendChild(element)
  }
}

function upsertCanonical(url: string) {
  const element = document.head.querySelector('link[rel="canonical"]') ?? document.createElement('link')
  element.setAttribute('rel', 'canonical')
  element.setAttribute('href', url)

  if (!element.parentNode) {
    document.head.appendChild(element)
  }
}

export function SeoHead({ metadata, schemas = [] }: SeoHeadProps) {
  useEffect(() => {
    const seo = resolveSeo(metadata)

    document.title = seo.title
    upsertCanonical(seo.canonicalPath)

    const description = seo.description
    upsertMeta('description', description)
    upsertMeta('robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('og:title', seo.ogTitle ?? seo.title)
    upsertMeta('og:description', seo.ogDescription ?? description)
    upsertMeta('og:type', 'website')
    upsertMeta('og:url', seo.canonicalPath)
    upsertMeta('og:image', seo.ogImage ?? '')
    upsertMeta('twitter:card', seo.twitterCard ?? 'summary_large_image')
    upsertMeta('twitter:title', seo.ogTitle ?? seo.title)
    upsertMeta('twitter:description', seo.ogDescription ?? description)
    upsertMeta('twitter:image', seo.ogImage ?? '')

    const existingSchemas = document.head.querySelectorAll('script[data-seo-schema="amaur"]')
    existingSchemas.forEach((node) => node.remove())

    schemas.forEach((schema) => {
      const script = document.createElement('script')
      script.setAttribute('type', 'application/ld+json')
      script.setAttribute('data-seo-schema', 'amaur')
      script.textContent = JSON.stringify(schema)
      document.head.appendChild(script)
    })

    return () => {
      const schemaNodes = document.head.querySelectorAll('script[data-seo-schema="amaur"]')
      schemaNodes.forEach((node) => node.remove())
    }
  }, [metadata, schemas])

  useEffect(() => {
    document.documentElement.setAttribute('lang', 'es-CL')
  }, [])

  return null
}

export function clearManagedSeo() {
  managedMetaNames.forEach((name) => {
    const selector = name.startsWith('og:') ? `meta[property="${name}"]` : `meta[name="${name}"]`
    const element = document.head.querySelector(selector)
    if (element) {
      element.remove()
    }
  })
}
