import { buildRouteMap, seedDatabase } from '@/modules/content/data/seedData'
import type { CmsDatabase, CmsSnapshot } from '@/modules/content/types/cms'

const STORAGE_KEY = 'amaur-content-cms-v1'
const LEGACY_SERVICE_SLUG = 'ergonomia-laboral'
const NEW_SERVICE_SLUG = 'bienestar-empresarial'
const LEGACY_CATEGORY_SLUG = 'ergonomia'
const NEW_CATEGORY_SLUG = 'bienestar-empresarial'
const LEGACY_POST_SLUG = 'checklist-ergonomico-en-bodegas'
const NEW_POST_SLUG = 'checklist-bienestar-empresarial-en-bodegas'
const LEGACY_FAQ_ID = 'faq-ergonomia-laboral-1'
const NEW_FAQ_ID = 'faq-bienestar-empresarial-1'
const LEGACY_SERVICE_ID = 'service-ergonomia-laboral'
const NEW_SERVICE_ID = 'service-bienestar-empresarial'
const LEGACY_CATEGORY_ID = 'cat-ergonomia'
const NEW_CATEGORY_ID = 'cat-bienestar-empresarial'

function cloneSeed(): CmsDatabase {
  return JSON.parse(JSON.stringify(seedDatabase)) as CmsDatabase
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function replaceServiceSlug(value: string): string {
  return value === LEGACY_SERVICE_SLUG ? NEW_SERVICE_SLUG : value
}

function replaceCategorySlug(value: string): string {
  return value === LEGACY_CATEGORY_SLUG ? NEW_CATEGORY_SLUG : value
}

function replacePostSlug(value: string): string {
  return value === LEGACY_POST_SLUG ? NEW_POST_SLUG : value
}

function replaceFaqId(value: string): string {
  return value === LEGACY_FAQ_ID ? NEW_FAQ_ID : value
}

function applyCaseFromSource(source: string, replacement: string): string {
  if (!source) {
    return replacement
  }

  return source[0] === source[0].toUpperCase()
    ? `${replacement.charAt(0).toUpperCase()}${replacement.slice(1)}`
    : replacement
}

function replaceRegexWithCase(value: string, pattern: RegExp, replacement: string): string {
  return value.replace(pattern, (match) => applyCaseFromSource(match, replacement))
}

function normalizeLegacyCopy(value: string): string {
  let next = value

  next = replaceRegexWithCase(next, /ergonom[ií]a laboral/gi, 'bienestar empresarial')
  next = replaceRegexWithCase(next, /ergonometr[ií]a/gi, 'bienestar empresarial')
  next = replaceRegexWithCase(next, /ergon[oó]m(?:ic|íc)(?:o|a|os|as)/gi, 'bienestar empresarial')
  next = replaceRegexWithCase(next, /ergonom[ií]a/gi, 'bienestar empresarial')

  return next
}

function hasArrayChanged(current: string[], next: string[]): boolean {
  return current.length !== next.length || next.some((value, index) => value !== current[index])
}

function migrateLegacyTerminology(database: CmsDatabase): { database: CmsDatabase; changed: boolean } {
  let changed = false

  const services = database.services.map((service) => {
    const nextSlug = replaceServiceSlug(service.slug)
    const nextId = service.id === LEGACY_SERVICE_ID ? NEW_SERVICE_ID : service.id
    const nextName = normalizeLegacyCopy(service.name)
    const nextShortDescription = normalizeLegacyCopy(service.shortDescription)
    const nextMainBenefit = normalizeLegacyCopy(service.mainBenefit)
    const nextIntro = normalizeLegacyCopy(service.intro)
    const nextProblems = service.problems.map(normalizeLegacyCopy)
    const nextBenefits = service.benefits.map(normalizeLegacyCopy)
    const nextHowItWorks = service.howItWorks.map(normalizeLegacyCopy)
    const nextAudience = service.audience.map(normalizeLegacyCopy)
    const nextCtaTitle = normalizeLegacyCopy(service.ctaTitle)
    const nextCtaDescription = normalizeLegacyCopy(service.ctaDescription)
    const nextRelatedServiceSlugs = service.relatedServiceSlugs.map(replaceServiceSlug)
    const nextRelatedBlogSlugs = service.relatedBlogSlugs.map(replacePostSlug)
    const nextFaqIds = service.faqIds.map(replaceFaqId)
    const nextCanonicalPath =
      service.seo.canonicalPath === `/servicios/${LEGACY_SERVICE_SLUG}`
        ? `/servicios/${NEW_SERVICE_SLUG}`
        : service.seo.canonicalPath
    const nextSeoTitle = normalizeLegacyCopy(service.seo.title)
    const nextSeoDescription = normalizeLegacyCopy(service.seo.description)
    const nextSeoOgTitle = service.seo.ogTitle ? normalizeLegacyCopy(service.seo.ogTitle) : service.seo.ogTitle
    const nextSeoOgDescription = service.seo.ogDescription
      ? normalizeLegacyCopy(service.seo.ogDescription)
      : service.seo.ogDescription

    const serviceChanged =
      nextSlug !== service.slug ||
      nextId !== service.id ||
      nextName !== service.name ||
      nextShortDescription !== service.shortDescription ||
      nextMainBenefit !== service.mainBenefit ||
      nextIntro !== service.intro ||
      nextCtaTitle !== service.ctaTitle ||
      nextCtaDescription !== service.ctaDescription ||
      nextCanonicalPath !== service.seo.canonicalPath ||
      nextSeoTitle !== service.seo.title ||
      nextSeoDescription !== service.seo.description ||
      nextSeoOgTitle !== service.seo.ogTitle ||
      nextSeoOgDescription !== service.seo.ogDescription ||
      hasArrayChanged(service.problems, nextProblems) ||
      hasArrayChanged(service.benefits, nextBenefits) ||
      hasArrayChanged(service.howItWorks, nextHowItWorks) ||
      hasArrayChanged(service.audience, nextAudience) ||
      hasArrayChanged(service.relatedServiceSlugs, nextRelatedServiceSlugs) ||
      hasArrayChanged(service.relatedBlogSlugs, nextRelatedBlogSlugs) ||
      hasArrayChanged(service.faqIds, nextFaqIds)

    if (!serviceChanged) {
      return service
    }

    changed = true
    return {
      ...service,
      id: nextId,
      slug: nextSlug,
      name: nextName,
      shortDescription: nextShortDescription,
      mainBenefit: nextMainBenefit,
      intro: nextIntro,
      problems: nextProblems,
      benefits: nextBenefits,
      howItWorks: nextHowItWorks,
      audience: nextAudience,
      relatedServiceSlugs: nextRelatedServiceSlugs,
      relatedBlogSlugs: nextRelatedBlogSlugs,
      faqIds: nextFaqIds,
      ctaTitle: nextCtaTitle,
      ctaDescription: nextCtaDescription,
      seo: {
        ...service.seo,
        title: nextSeoTitle,
        description: nextSeoDescription,
        canonicalPath: nextCanonicalPath,
        ogTitle: nextSeoOgTitle,
        ogDescription: nextSeoOgDescription,
      },
    }
  })

  const posts = database.posts.map((post) => {
    const nextSlug = replacePostSlug(post.slug)
    const nextTitle = normalizeLegacyCopy(post.title)
    const nextExcerpt = normalizeLegacyCopy(post.excerpt)
    const nextCategorySlug = replaceCategorySlug(post.categorySlug)
    const nextRelatedServiceSlugs = post.relatedServiceSlugs.map(replaceServiceSlug)
    const nextCtaLabel = normalizeLegacyCopy(post.ctaLabel)
    const nextCtaHref =
      post.ctaHref === `/servicios/${LEGACY_SERVICE_SLUG}` ? `/servicios/${NEW_SERVICE_SLUG}` : post.ctaHref
    const nextSections = post.sections.map((section) => ({
      ...section,
      heading: normalizeLegacyCopy(section.heading),
      paragraphs: section.paragraphs.map(normalizeLegacyCopy),
    }))
    const nextCanonicalPath =
      post.seo.canonicalPath === `/blog/${LEGACY_POST_SLUG}`
        ? `/blog/${NEW_POST_SLUG}`
        : post.seo.canonicalPath
    const nextSeoTitle = normalizeLegacyCopy(post.seo.title)
    const nextSeoDescription = normalizeLegacyCopy(post.seo.description)
    const nextSeoOgTitle = post.seo.ogTitle ? normalizeLegacyCopy(post.seo.ogTitle) : post.seo.ogTitle
    const nextSeoOgDescription = post.seo.ogDescription
      ? normalizeLegacyCopy(post.seo.ogDescription)
      : post.seo.ogDescription

    const sectionsChanged =
      nextSections.length !== post.sections.length ||
      nextSections.some((section, index) => {
        const currentSection = post.sections[index]
        return (
          section.heading !== currentSection.heading ||
          hasArrayChanged(currentSection.paragraphs, section.paragraphs)
        )
      })

    const postChanged =
      nextSlug !== post.slug ||
      nextTitle !== post.title ||
      nextExcerpt !== post.excerpt ||
      nextCategorySlug !== post.categorySlug ||
      nextCtaLabel !== post.ctaLabel ||
      nextCtaHref !== post.ctaHref ||
      nextCanonicalPath !== post.seo.canonicalPath ||
      nextSeoTitle !== post.seo.title ||
      nextSeoDescription !== post.seo.description ||
      nextSeoOgTitle !== post.seo.ogTitle ||
      nextSeoOgDescription !== post.seo.ogDescription ||
      hasArrayChanged(post.relatedServiceSlugs, nextRelatedServiceSlugs) ||
      sectionsChanged

    if (!postChanged) {
      return post
    }

    changed = true
    return {
      ...post,
      slug: nextSlug,
      title: nextTitle,
      excerpt: nextExcerpt,
      categorySlug: nextCategorySlug,
      relatedServiceSlugs: nextRelatedServiceSlugs,
      ctaLabel: nextCtaLabel,
      ctaHref: nextCtaHref,
      sections: nextSections,
      seo: {
        ...post.seo,
        title: nextSeoTitle,
        description: nextSeoDescription,
        canonicalPath: nextCanonicalPath,
        ogTitle: nextSeoOgTitle,
        ogDescription: nextSeoOgDescription,
      },
    }
  })

  const categories = database.categories.map((category) => {
    const nextSlug = replaceCategorySlug(category.slug)
    const nextId = category.id === LEGACY_CATEGORY_ID ? NEW_CATEGORY_ID : category.id
    const nextName = normalizeLegacyCopy(category.name)
    const nextDescription = normalizeLegacyCopy(category.description)

    if (nextSlug === category.slug && nextId === category.id && nextName === category.name && nextDescription === category.description) {
      return category
    }

    changed = true
    return {
      ...category,
      id: nextId,
      slug: nextSlug,
      name: nextName,
      description: nextDescription,
    }
  })

  const faqs = database.faqs.map((faq) => {
    const nextId = replaceFaqId(faq.id)
    const nextPagePath =
      faq.pagePath === `/servicios/${LEGACY_SERVICE_SLUG}` ? `/servicios/${NEW_SERVICE_SLUG}` : faq.pagePath
    const nextQuestion = normalizeLegacyCopy(faq.question)
    const nextAnswer = normalizeLegacyCopy(faq.answer)

    if (
      nextId === faq.id &&
      nextPagePath === faq.pagePath &&
      nextQuestion === faq.question &&
      nextAnswer === faq.answer
    ) {
      return faq
    }

    changed = true
    return {
      ...faq,
      id: nextId,
      pagePath: nextPagePath,
      question: nextQuestion,
      answer: nextAnswer,
    }
  })

  const pages = database.pages.map((page) => {
    const nextTitle = normalizeLegacyCopy(page.title)
    const nextDescription = normalizeLegacyCopy(page.description)
    const nextHeroTitle = normalizeLegacyCopy(page.heroTitle)
    const nextHeroSubtitle = normalizeLegacyCopy(page.heroSubtitle)
    const nextBodySections = page.bodySections.map((section) => ({
      ...section,
      title: normalizeLegacyCopy(section.title),
      content: section.content.map(normalizeLegacyCopy),
    }))
    const nextSeoTitle = normalizeLegacyCopy(page.seo.title)
    const nextSeoDescription = normalizeLegacyCopy(page.seo.description)
    const nextSeoOgTitle = page.seo.ogTitle ? normalizeLegacyCopy(page.seo.ogTitle) : page.seo.ogTitle
    const nextSeoOgDescription = page.seo.ogDescription
      ? normalizeLegacyCopy(page.seo.ogDescription)
      : page.seo.ogDescription

    const sectionsChanged =
      nextBodySections.length !== page.bodySections.length ||
      nextBodySections.some((section, index) => {
        const currentSection = page.bodySections[index]
        return section.title !== currentSection.title || hasArrayChanged(currentSection.content, section.content)
      })

    const pageChanged =
      nextTitle !== page.title ||
      nextDescription !== page.description ||
      nextHeroTitle !== page.heroTitle ||
      nextHeroSubtitle !== page.heroSubtitle ||
      nextSeoTitle !== page.seo.title ||
      nextSeoDescription !== page.seo.description ||
      nextSeoOgTitle !== page.seo.ogTitle ||
      nextSeoOgDescription !== page.seo.ogDescription ||
      sectionsChanged

    if (!pageChanged) {
      return page
    }

    changed = true
    return {
      ...page,
      title: nextTitle,
      description: nextDescription,
      heroTitle: nextHeroTitle,
      heroSubtitle: nextHeroSubtitle,
      bodySections: nextBodySections,
      seo: {
        ...page.seo,
        title: nextSeoTitle,
        description: nextSeoDescription,
        ogTitle: nextSeoOgTitle,
        ogDescription: nextSeoOgDescription,
      },
    }
  })

  const testimonials = database.testimonials.map((testimonial) => {
    const nextAuthor = normalizeLegacyCopy(testimonial.author)
    const nextRole = normalizeLegacyCopy(testimonial.role)
    const nextQuote = normalizeLegacyCopy(testimonial.quote)
    const nextSource = testimonial.source ? normalizeLegacyCopy(testimonial.source) : testimonial.source

    if (
      nextAuthor === testimonial.author &&
      nextRole === testimonial.role &&
      nextQuote === testimonial.quote &&
      nextSource === testimonial.source
    ) {
      return testimonial
    }

    changed = true
    return {
      ...testimonial,
      author: nextAuthor,
      role: nextRole,
      quote: nextQuote,
      source: nextSource,
    }
  })

  const seoEntries = database.seoEntries.map((entry) => {
    const nextPath =
      entry.path === `/servicios/${LEGACY_SERVICE_SLUG}`
        ? `/servicios/${NEW_SERVICE_SLUG}`
        : entry.path === `/blog/${LEGACY_POST_SLUG}`
          ? `/blog/${NEW_POST_SLUG}`
          : entry.path
    const nextSeoTitle = normalizeLegacyCopy(entry.seo.title)
    const nextSeoDescription = normalizeLegacyCopy(entry.seo.description)
    const nextSeoOgTitle = entry.seo.ogTitle ? normalizeLegacyCopy(entry.seo.ogTitle) : entry.seo.ogTitle
    const nextSeoOgDescription = entry.seo.ogDescription
      ? normalizeLegacyCopy(entry.seo.ogDescription)
      : entry.seo.ogDescription

    if (
      nextPath === entry.path &&
      nextSeoTitle === entry.seo.title &&
      nextSeoDescription === entry.seo.description &&
      nextSeoOgTitle === entry.seo.ogTitle &&
      nextSeoOgDescription === entry.seo.ogDescription
    ) {
      return entry
    }

    changed = true
    return {
      ...entry,
      path: nextPath,
      seo: {
        ...entry.seo,
        title: nextSeoTitle,
        description: nextSeoDescription,
        ogTitle: nextSeoOgTitle,
        ogDescription: nextSeoOgDescription,
      },
    }
  })

  const settings = (() => {
    const nextWhatsapp = database.settings.whatsappNumber === '56911111111' ? '56937544837' : database.settings.whatsappNumber
    const nextPhone = database.settings.phone === '+56 9 1111 1111' ? '+56 9 3754 4837' : database.settings.phone
    const nextAddress = database.settings.address === 'Providencia 000, Santiago' ? 'Santiago, Chile' : database.settings.address
    const nextCoverage =
      database.settings.geoCoverage === 'Santiago y comunas cercanas' ? 'Todo Santiago' : database.settings.geoCoverage
    const nextInstagram = database.settings.instagramUrl ?? 'https://www.instagram.com/amaurchile/'
    const nextLinkedin = database.settings.linkedinUrl ?? 'https://www.linkedin.com/company/amaur-chile/'
    const nextTiktok = database.settings.tiktokUrl ?? 'https://www.tiktok.com/@amaurchile'

    if (
      nextWhatsapp === database.settings.whatsappNumber &&
      nextPhone === database.settings.phone &&
      nextAddress === database.settings.address &&
      nextCoverage === database.settings.geoCoverage &&
      nextInstagram === database.settings.instagramUrl &&
      nextLinkedin === database.settings.linkedinUrl &&
      nextTiktok === database.settings.tiktokUrl
    ) {
      return database.settings
    }

    changed = true
    return {
      ...database.settings,
      whatsappNumber: nextWhatsapp,
      phone: nextPhone,
      address: nextAddress,
      geoCoverage: nextCoverage,
      instagramUrl: nextInstagram,
      linkedinUrl: nextLinkedin,
      tiktokUrl: nextTiktok,
    }
  })()
  if (!changed) {
    return { database, changed }
  }

  return {
    database: {
      ...database,
      pages,
      services,
      posts,
      categories,
      faqs,
      testimonials,
      seoEntries,
      settings,
    },
    changed,
  }
}

export function readDatabase(): CmsDatabase {
  if (!canUseLocalStorage()) {
    return cloneSeed()
  }

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = cloneSeed()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    const parsed = JSON.parse(raw) as CmsDatabase
    const { database, changed } = migrateLegacyTerminology(parsed)

    if (changed) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database))
    }

    return database
  } catch {
    const seed = cloneSeed()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

export function writeDatabase(database: CmsDatabase): CmsDatabase {
  const next: CmsDatabase = {
    ...database,
    updatedAt: new Date().toISOString(),
  }

  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  return next
}

export function updateDatabase(mutator: (current: CmsDatabase) => CmsDatabase): CmsDatabase {
  const current = readDatabase()
  const next = mutator(current)
  return writeDatabase(next)
}

export function resetDatabase(): CmsDatabase {
  const seed = cloneSeed()
  return writeDatabase(seed)
}

export function snapshotFrom(database: CmsDatabase): CmsSnapshot {
  return {
    ...database,
    routeMap: buildRouteMap(database),
  }
}


