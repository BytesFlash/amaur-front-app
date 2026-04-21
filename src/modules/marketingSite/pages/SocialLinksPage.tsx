import { ArrowUpRight, Globe, Instagram, Linkedin, MessageCircle, Music2 } from 'lucide-react'
import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import type { SeoMetadata } from '@/modules/content/types/cms'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { buildWhatsappLink, siteConfig } from '@/modules/marketingSite/config/siteConfig'
import { localBusinessSchema, organizationSchema } from '@/modules/marketingSite/lib/seo'

const linksPageMeta: SeoMetadata = {
  title: 'AMAUR | Acceso directo',
  description: 'Accede rapido al sitio web, WhatsApp, Instagram, LinkedIn y TikTok de AMAUR.',
  canonicalPath: '/r',
  ogTitle: 'AMAUR accesos directos',
  ogDescription: 'Todos los canales de AMAUR en un solo lugar.',
  ogImage: '/assets/brand/amaur-logo-dark.png',
  twitterCard: 'summary_large_image',
  noIndex: true,
}

const baseLinks = [
  {
    id: 'website',
    title: 'Sitio web',
    description: 'Explora servicios, empresas, blog y contacto en AMAUR.',
    icon: Globe,
    accent: 'from-slate-400/25 to-emerald-300/15',
    href: siteConfig.siteUrl,
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Agenda o consulta de inmediato por mensaje directo.',
    icon: MessageCircle,
    accent: 'from-emerald-500/30 to-lime-400/15',
    href: '',
  },
  {
    id: 'instagram',
    title: 'Instagram',
    description: 'Contenido, novedades y actualizaciones de AMAUR.',
    icon: Instagram,
    accent: 'from-pink-500/25 to-amber-400/15',
    href: siteConfig.instagramUrl,
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    description: 'Perfil profesional y enfoque corporativo B2B.',
    icon: Linkedin,
    accent: 'from-sky-500/25 to-blue-500/15',
    href: siteConfig.linkedinUrl,
  },
  {
    id: 'tiktok',
    title: 'TikTok',
    description: 'Micro contenido de bienestar y educacion en salud.',
    icon: Music2,
    accent: 'from-fuchsia-500/20 to-cyan-400/15',
    href: siteConfig.tiktokUrl,
  },
] as const

export function SocialLinksPage() {
  const { data } = usePublicSnapshot()

  const whatsappLink = buildWhatsappLink(
    siteConfig.defaultWhatsappMessagePerson,
    data?.settings.whatsappNumber ?? siteConfig.whatsappNumber,
  )

  const links = baseLinks.map((link) => {
    if (link.id === 'whatsapp') {
      return { ...link, href: whatsappLink }
    }

    if (link.id === 'instagram') {
      return { ...link, href: data?.settings.instagramUrl ?? siteConfig.instagramUrl }
    }

    if (link.id === 'linkedin') {
      return { ...link, href: data?.settings.linkedinUrl ?? siteConfig.linkedinUrl }
    }

    if (link.id === 'tiktok') {
      return { ...link, href: data?.settings.tiktokUrl ?? siteConfig.tiktokUrl }
    }

    return link
  })

  return (
    <>
      <SeoHead
        metadata={linksPageMeta}
        schemas={[
          organizationSchema(),
          localBusinessSchema({ description: linksPageMeta.description }),
        ]}
      />

      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.24),_transparent_36%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.15),_transparent_30%),linear-gradient(180deg,_#f7f5ee_0%,_#f4f8f2_48%,_#faf9f4_100%)] px-4 py-10 sm:px-6">
        <section className="mx-auto w-full max-w-3xl rounded-[2.4rem] border border-slate-900/10 bg-white/78 p-6 shadow-[0_45px_120px_-60px_rgba(15,23,42,0.55)] backdrop-blur sm:p-8">
          <div className="flex flex-col items-center text-center">
            <img
              src="/assets/brand/amaur-logo-dark.png"
              alt="Logo AMAUR"
              className="h-16 w-16 object-contain"
              fetchPriority="high"
            />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Acceso directo AMAUR</p>
            <h1 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight text-slate-950 sm:text-5xl">
              Todos nuestros canales en un solo lugar
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Elige donde quieres contactarnos o ver contenido. Ideal para compartir desde QR, bio o mensajes directos.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {links.map((link) => {
              const Icon = link.icon

              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_26px_75px_-40px_rgba(5,150,105,0.45)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${link.accent} text-slate-900`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-700" />
                  </div>

                  <h2 className="mt-4 text-lg font-semibold text-slate-900">{link.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{link.description}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Abrir canal</p>
                </a>
              )
            })}
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-slate-500">
            Si quieres, guarda este enlace como acceso rapido en tu QR principal.
          </p>
        </section>
      </main>
    </>
  )
}
