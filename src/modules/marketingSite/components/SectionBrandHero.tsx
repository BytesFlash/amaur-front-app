import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

interface HeroAction {
  label: string
  href: string
  external?: boolean
}

interface SectionBrandHeroProps {
  sectionLabel: string
  title: string
  description: string
  imageUrl: string
  imageAlt: string
  imagePosition?: 'left' | 'right'
  imageStyle?: 'cinema' | 'soft'
  chips?: string[]
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  tone?: 'light' | 'dark'
}

function HeroActionLink({
  action,
  primary,
  isDark,
}: {
  action: HeroAction
  primary: boolean
  isDark: boolean
}) {
  const baseClass = primary
    ? cn(
        'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
        isDark ? 'bg-white text-slate-900 hover:bg-emerald-100' : 'bg-slate-900 text-white hover:bg-slate-800',
      )
    : cn(
        'inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors',
        isDark ? 'border-white/30 text-white hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-white',
      )

  if (action.external || action.href.startsWith('http')) {
    return (
      <a href={action.href} target="_blank" rel="noreferrer" className={baseClass}>
        {action.label}
        {primary && <ArrowRight className="ml-2 h-4 w-4" />}
      </a>
    )
  }

  return (
    <Link to={action.href} className={baseClass}>
      {action.label}
      {primary && <ArrowRight className="ml-2 h-4 w-4" />}
    </Link>
  )
}

export function SectionBrandHero({
  sectionLabel,
  title,
  description,
  imageUrl,
  imageAlt,
  imagePosition = 'right',
  imageStyle = 'cinema',
  chips = [],
  primaryAction,
  secondaryAction,
  tone = 'light',
}: SectionBrandHeroProps) {
  const isDark = tone === 'dark'
  const imageOnLeft = imagePosition === 'left'
  const isSoftImage = imageStyle === 'soft'

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2.3rem] border p-6 shadow-[0_40px_110px_-70px_rgba(15,23,42,0.55)] sm:p-8 lg:grid-cols-[1.03fr_0.97fr] lg:p-10',
        isDark
          ? 'grid gap-7 border-slate-800 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.14),_transparent_44%),linear-gradient(180deg,#020617,#111827)] text-white'
          : 'grid gap-7 border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_46%),linear-gradient(180deg,#f9fbf8,#f2f5ee)] text-slate-900',
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-8 -top-8 hidden h-44 w-44 rounded-full blur-2xl lg:block',
          isDark ? 'bg-emerald-200/15' : 'bg-emerald-200/55',
        )}
      />

      <article className={cn(imageOnLeft ? 'lg:order-2' : 'lg:order-1')}>
        <div
          className={cn(
            'inline-flex items-center gap-3 rounded-full border px-3 py-1.5',
            isDark ? 'border-white/20 bg-white/10' : 'border-emerald-300/50 bg-white/70',
          )}
        >
          <img src="/assets/brand/amaur-logo-dark.png" alt="Logo AMAUR" className="h-5 w-5 object-contain" />
          <span
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.24em]',
              isDark ? 'text-emerald-200' : 'text-emerald-700',
            )}
          >
            {sectionLabel}
          </span>
        </div>

        <h1
          className={cn(
            'mt-5 max-w-3xl font-["Georgia","Iowan_Old_Style","Palatino_Linotype",serif] text-4xl leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl',
            isDark ? 'text-white' : 'text-slate-950',
          )}
        >
          {title}
        </h1>
        <p
          className={cn(
            'mt-5 max-w-2xl text-base leading-8 sm:text-lg',
            isDark ? 'text-slate-200' : 'text-slate-600',
          )}
        >
          {description}
        </p>

        {!!chips.length && (
          <div className="mt-6 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]',
                  isDark
                    ? 'border-white/20 bg-white/10 text-white/85'
                    : 'border-slate-200 bg-white text-slate-600',
                )}
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          {primaryAction && (
            <HeroActionLink action={primaryAction} primary isDark={isDark} />
          )}
          {secondaryAction && (
            <HeroActionLink action={secondaryAction} primary={false} isDark={isDark} />
          )}
        </div>
      </article>

      <article
        className={cn(
          'relative overflow-hidden rounded-[2rem] border bg-white/10',
          imageOnLeft ? 'lg:order-1' : 'lg:order-2',
          isSoftImage ? 'border-slate-200/70 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.55)]' : 'border-white/30',
        )}
      >
        <img src={imageUrl} alt={imageAlt} className="h-full min-h-[360px] w-full object-cover" loading="eager" />
        {isSoftImage ? (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.52))]" />
            <div className="pointer-events-none absolute -left-8 -top-10 h-32 w-32 rounded-full bg-emerald-200/45 blur-2xl" />
            <div className="pointer-events-none absolute right-2 top-3 rounded-full border border-white/25 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
              Entrada AMAUR
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[1.2rem] border border-white/15 bg-slate-900/80 px-4 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">AMAUR</p>
              <p className="mt-1 text-sm font-medium leading-6 text-white/90">
                Bienestar integral serio con una experiencia visual mas limpia, calmada y cercana.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.62))]" />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur">
              Marca AMAUR
            </div>
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-[1.2rem] border border-white/20 bg-black/25 px-4 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">AMAUR</p>
              <p className="mt-1 text-sm leading-6 text-white/90">
                Cuidado terapeutico y bienestar empresarial con una experiencia clara, humana y confiable.
              </p>
            </div>
          </>
        )}
      </article>
    </section>
  )
}
