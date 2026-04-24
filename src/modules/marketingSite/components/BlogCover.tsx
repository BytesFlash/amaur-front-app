import type { LucideIcon } from 'lucide-react'
import { Activity, BriefcaseBusiness, HeartHandshake, LaptopMinimal, Sparkles, Waves } from 'lucide-react'

const coverPalette: Record<string, { gradient: string; icon: LucideIcon; tint: string }> = {
  'estres-y-relajacion': {
    gradient: 'from-emerald-100 via-cyan-50 to-slate-100',
    icon: Sparkles,
    tint: 'text-emerald-700',
  },
  'dolor-muscular-y-postura': {
    gradient: 'from-amber-100 via-orange-50 to-slate-100',
    icon: Activity,
    tint: 'text-amber-700',
  },
  'bienestar-laboral': {
    gradient: 'from-slate-200 via-blue-50 to-emerald-100',
    icon: BriefcaseBusiness,
    tint: 'text-slate-700',
  },
  'pausas-activas': {
    gradient: 'from-lime-100 via-emerald-50 to-cyan-100',
    icon: Waves,
    tint: 'text-emerald-700',
  },
  'bienestar-empresarial': {
    gradient: 'from-violet-100 via-slate-100 to-emerald-50',
    icon: BriefcaseBusiness,
    tint: 'text-violet-700',
  },
  kinesiologia: {
    gradient: 'from-sky-100 via-cyan-50 to-slate-100',
    icon: Activity,
    tint: 'text-sky-700',
  },
  'terapia-ocupacional': {
    gradient: 'from-emerald-100 via-teal-50 to-slate-100',
    icon: HeartHandshake,
    tint: 'text-emerald-700',
  },
  telemedicina: {
    gradient: 'from-blue-100 via-slate-50 to-cyan-100',
    icon: LaptopMinimal,
    tint: 'text-blue-700',
  },
}

interface BlogCoverProps {
  categorySlug: string
  title: string
  imageUrl?: string
  compact?: boolean
}

export function BlogCover({ categorySlug, title, imageUrl, compact = false }: BlogCoverProps) {
  const palette = coverPalette[categorySlug] ?? {
    gradient: 'from-slate-100 via-slate-50 to-emerald-50',
    icon: Sparkles,
    tint: 'text-slate-700',
  }
  const Icon = palette.icon
  const height = compact ? 'h-44' : 'h-64 sm:h-72'

  // — Con foto real: imagen full-width + overlay oscuro para que el texto resalte
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl border border-slate-200 ${height}`}>
        <img
          src={imageUrl}
          alt={`Imagen destacada de ${title}`}
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        {/* Overlay: transparente arriba, oscuro abajo */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.10)_0%,rgba(2,6,23,0.62)_100%)]" />

        {/* Icono de categoría */}
        <div className={`absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/85 shadow-sm ${palette.tint}`}>
          <Icon className="h-4 w-4" />
        </div>

        {/* Título sobre la foto */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="line-clamp-2 text-base font-semibold leading-snug text-white drop-shadow-sm">{title}</p>
        </div>
      </div>
    )
  }

  // — Sin foto: placeholder con gradiente de color por categoría (comportamiento original)
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br ${palette.gradient} ${height}`}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/50 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-emerald-200/35 blur-2xl" />

      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 ${palette.tint}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">{title}</p>
        </div>
      </div>
    </div>
  )
}
