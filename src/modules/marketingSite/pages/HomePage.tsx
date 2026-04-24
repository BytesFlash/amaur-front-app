import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartHandshake,
  Quote,
  Sparkles,
  Star,
  Stethoscope,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import { usePublicSnapshot } from '@/modules/content/hooks/usePublicContent'
import { CtaBanner } from '@/modules/marketingSite/components/CtaBanner'
import { FaqList } from '@/modules/marketingSite/components/FaqList'
import { SectionBrandHero } from '@/modules/marketingSite/components/SectionBrandHero'
import { SeoHead } from '@/modules/marketingSite/components/SeoHead'
import { localBusinessSchema, organizationSchema } from '@/modules/marketingSite/lib/seo'
import { buildWhatsappLink, siteConfig } from '@/modules/marketingSite/config/siteConfig'
import { getServiceHeroImage, getServiceImageAlt } from '@/modules/marketingSite/config/serviceImages'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'

const stressMessages = [
  { min: 0, max: 24, label: 'Carga baja', note: 'Mejor alineacion y menor compensacion corporal.' },
  { min: 25, max: 49, label: 'Alerta temprana', note: 'Comienzan rigidez y cansancio muscular.' },
  { min: 50, max: 74, label: 'Sobrecarga diaria', note: 'Aumenta la fatiga y baja la movilidad percibida.' },
  { min: 75, max: 100, label: 'Alta tension', note: 'Se intensifican dolor, fatiga y desorden postural.' },
]

const serviceVisuals: Record<string, { icon: LucideIcon; accent: string }> = {
  kinesiologia: { icon: Activity, accent: 'from-sky-500/20 to-teal-500/10' },
  'terapia-ocupacional': { icon: HeartHandshake, accent: 'from-emerald-500/20 to-cyan-500/10' },
  telemedicina: { icon: Stethoscope, accent: 'from-blue-500/20 to-cyan-500/10' },
  'masajes-descontracturantes': { icon: Waves, accent: 'from-amber-400/20 to-orange-500/10' },
  'masajes-relajacion': { icon: Waves, accent: 'from-amber-300/20 to-lime-300/10' },
  'pausas-activas': { icon: Sparkles, accent: 'from-emerald-500/20 to-lime-400/10' },
  'bienestar-empresarial': { icon: BriefcaseBusiness, accent: 'from-violet-500/15 to-emerald-500/10' },
}

const companyHighlights: Array<{
  title: string
  description: string
  label: string
  icon: LucideIcon
  accent: string
}> = [
  {
    title: 'Menos estres acumulado',
    description: 'Rutinas breves para bajar la carga diaria sin frenar la operacion del equipo.',
    label: 'Pausas activas',
    icon: Sparkles,
    accent: 'from-emerald-300/30 to-cyan-300/10',
  },
  {
    title: 'Molestias musculares bajo control',
    description: 'Acciones preventivas para cuello, espalda y hombros segun tipo de puesto.',
    label: 'Prevencion en jornada',
    icon: Activity,
    accent: 'from-sky-300/30 to-emerald-300/10',
  },
  {
    title: 'Experiencia de equipo mas humana',
    description: 'Intervenciones que mejoran percepcion de cuidado y clima laboral sostenido.',
    label: 'Bienestar empresarial',
    icon: HeartHandshake,
    accent: 'from-violet-300/25 to-emerald-300/10',
  },
  {
    title: 'Seguimiento para sostener resultados',
    description: 'Acompanamiento preventivo continuo con ajustes por sede, area o turno.',
    label: 'Formato mensual',
    icon: BriefcaseBusiness,
    accent: 'from-amber-300/25 to-lime-300/10',
  },
]

export function HomePage() {
  const { data } = usePublicSnapshot()
  const [stressLevel, setStressLevel] = useState(64)
  const [activeServiceSlug, setActiveServiceSlug] = useState('')

  useEffect(() => {
    if (!data) {
      return
    }

    if (!activeServiceSlug && data.services.length > 0) {
      setActiveServiceSlug(data.services[0].slug)
    }
  }, [activeServiceSlug, data])

  if (!data) {
    return null
  }

  const page = data.pages.find((item) => item.path === '/')
  if (!page) {
    return null
  }

  const services = data.services.filter((service) => service.status === 'published')
  if (!services.length) {
    return null
  }
  const homeFaqs = data.faqs.filter((faq) => faq.pagePath === '/servicios').slice(0, 4)
  const whatsappHref = buildWhatsappLink(siteConfig.defaultWhatsappMessagePerson, data.settings.whatsappNumber)

  const activeService = services.find((service) => service.slug === activeServiceSlug) ?? services[0]
  const activeVisual = serviceVisuals[activeService?.slug] ?? { icon: Sparkles, accent: 'from-emerald-500/20 to-cyan-500/10' }
  const activeServiceImage = getServiceHeroImage(activeService.slug, activeService.heroImage)
  const activeServiceAlt = getServiceImageAlt(activeService.slug, activeService.name)

  const postureCurve = stressLevel / 100
  const expressionCurve = Math.min(stressLevel, 94) / 94
  const isComicCollapse = stressLevel >= 95
  const eyeOpen = Number((5.8 - expressionCurve * 2.4).toFixed(1))
  const eyebrowOuterY = Number((24 + expressionCurve * 4).toFixed(1))
  const eyebrowInnerY = Number((21 + expressionCurve * 15).toFixed(1))
  const mouthControlY = Number((68 - expressionCurve * 30).toFixed(1))
  const stressState = stressMessages.find((item) => stressLevel >= item.min && stressLevel <= item.max) ?? stressMessages[2]

  const vertebrae = Array.from({ length: 8 }, (_, index) => {
    const distance = index - 3.5
    return {
      id: index,
      x: Math.round(distance * distance * 2.6 * postureCurve * postureCurve * (distance < 0 ? -1 : 1)),
      rotate: Number((distance * postureCurve * postureCurve * 4.2).toFixed(1)),
      width: index === 0 || index === 7 ? 46 : index === 1 || index === 6 ? 52 : 60,
      glow: 0.18 + postureCurve * (index >= 4 ? 0.34 : 0.18),
    }
  })

  const ribOffsets = [-34, -24, -14, -4, 6, 16]

  return (
    <>
      <SeoHead
        metadata={page.seo}
        schemas={[organizationSchema(), localBusinessSchema({ description: page.seo.description })]}
      />

      <SectionBrandHero
        sectionLabel="Inicio"
        title={page.heroTitle}
        description={page.heroSubtitle}
        imageUrl={getServiceHeroImage('kinesiologia')}
        imageAlt={getServiceImageAlt('kinesiologia', 'Kinesiologia')}
        imagePosition="left"
        imageStyle="soft"
        chips={services.slice(0, 4).map((service) => service.name)}
        primaryAction={{ label: 'Quiero conocer los servicios', href: '/servicios' }}
        secondaryAction={{ label: 'Hablar por WhatsApp', href: whatsappHref, external: true }}
      />

      <section className="mt-12 grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Servicios</p>
          <h2 className="mt-4 max-w-2xl font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl leading-tight text-slate-950 sm:text-4xl">
            Cada servicio tiene un impacto distinto en la vida diaria.
          </h2>
          <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
            Informacion clara, relaciones utiles entre servicios y una forma simple de encontrar el apoyo que necesitas.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
            {services.map((service) => {
              const visual = serviceVisuals[service.slug] ?? serviceVisuals.kinesiologia
              const Icon = visual.icon

              return (
                <button
                  key={service.id}
                  type="button"
                  onMouseEnter={() => setActiveServiceSlug(service.slug)}
                  onFocus={() => setActiveServiceSlug(service.slug)}
                  onClick={() => setActiveServiceSlug(service.slug)}
                  className={cn(
                    'w-full rounded-[1.25rem] border px-4 py-3.5 text-left transition-all duration-300',
                    activeService.slug === service.slug
                      ? 'border-emerald-300 bg-white shadow-[0_22px_70px_-35px_rgba(5,150,105,0.35)]'
                      : 'border-slate-900/10 bg-white/70 hover:bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-slate-900', visual.accent)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[15px] font-semibold text-slate-950">{service.name}</p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">{service.shortDescription}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', activeService.slug === service.slug && 'translate-x-1 text-emerald-700')} />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="rounded-[1.75rem] border border-slate-900/10 bg-white/78 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-slate-900', activeVisual.accent)}>
              <activeVisual.icon className="h-5 w-5" />
            </div>
            <div className="mt-4 overflow-hidden rounded-[1.1rem] border border-slate-200">
              <img
                src={activeServiceImage}
                alt={activeServiceAlt}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-950">{activeService.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{activeService.shortDescription}</p>
            <div className="mt-4 rounded-[1.2rem] bg-[linear-gradient(180deg,#f5fbf8,#eef9f5)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-700">beneficio principal</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{activeService.mainBenefit}</p>
            </div>
            <Button asChild variant="outline" className="mt-4 rounded-full border-slate-300 bg-white/70 px-5 text-slate-700 hover:bg-white">
              <Link to={`/servicios/${activeService.slug}`}>Ver landing completa</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 rounded-[2.6rem] border border-slate-900/10 bg-[#efebe1] p-8 shadow-[0_45px_130px_-60px_rgba(15,23,42,0.22)] sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
        <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200/75">Simulador de carga diaria</p>
          <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight">
            A veces el malestar no aparece de golpe. Se va acumulando durante el dia.
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/72">
            Mueve el nivel de estres y observa como cambia la referencia de la columna para visualizar sobrecarga y fatiga.
          </p>
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
            <div className="flex items-center justify-between text-sm text-white/72">
              <span>Estres diario</span>
              <span>{stressLevel}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={stressLevel}
              onChange={(event) => setStressLevel(Number(event.target.value))}
              className="amaur-range mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/15"
              aria-label="Nivel de estres diario"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-emerald-100">{stressState.label}</p>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full bg-white text-slate-950 hover:bg-emerald-50"
                onClick={() => setStressLevel(12)}
              >
                Ver mejora con AMAUR
              </Button>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/74">{stressState.note}</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[linear-gradient(180deg,#f8fafc,#edf7f3)] p-6">
          <div className="relative mx-auto mt-2 h-[560px] max-w-[340px] overflow-hidden rounded-[1.9rem] border border-white/80 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_34%),linear-gradient(180deg,#ffffff,#f2fbf7)] p-4 shadow-inner">
            <div className="absolute inset-y-6 left-1/2 w-[2px] -translate-x-1/2 bg-emerald-300/50" />
            <div className="absolute right-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
              {stressState.label}
            </div>

            <div
              className="absolute top-8 h-[88px] w-[74px] -translate-x-1/2 rounded-[48%] border border-[#eadfc8] bg-[radial-gradient(circle_at_45%_35%,#fffaf0,_#f0e4cf_55%,_#d6bea0)] shadow-[0_24px_55px_-30px_rgba(15,23,42,0.38)] transition-all duration-700"
              style={{ left: `calc(50% + ${Math.round(12 * postureCurve * postureCurve)}px)` }}
            >
              <div className="absolute left-1/2 top-[18px] h-[14px] w-[16px] -translate-x-1/2 rounded-full border border-[#d9c5a6] bg-[#f6ebd8]" />
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 74 88" aria-hidden="true">
                {isComicCollapse ? (
                  <>
                    <line x1="19" y1="34" x2="29" y2="44" stroke="rgba(114, 93, 75, 0.7)" strokeWidth="2.6" strokeLinecap="round" />
                    <line x1="29" y1="34" x2="19" y2="44" stroke="rgba(114, 93, 75, 0.7)" strokeWidth="2.6" strokeLinecap="round" />
                    <line x1="45" y1="34" x2="55" y2="44" stroke="rgba(114, 93, 75, 0.7)" strokeWidth="2.6" strokeLinecap="round" />
                    <line x1="55" y1="34" x2="45" y2="44" stroke="rgba(114, 93, 75, 0.7)" strokeWidth="2.6" strokeLinecap="round" />
                    <path d="M 25 58 Q 37 52 49 58" stroke="rgba(201, 177, 145, 0.95)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                    <path d="M 33 58 Q 37 64 41 58 L 41 72 Q 37 80 33 72 Z" fill="rgba(241, 128, 128, 0.9)" stroke="rgba(220, 94, 94, 0.55)" strokeWidth="1.2" />
                  </>
                ) : (
                  <>
                    <path d={`M 16 ${eyebrowOuterY} Q 22 ${Number((eyebrowOuterY - 2.5).toFixed(1))} 30 ${eyebrowInnerY}`} stroke="rgba(124, 96, 72, 0.55)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                    <path d={`M 44 ${eyebrowInnerY} Q 52 ${Number((eyebrowOuterY - 2.5).toFixed(1))} 58 ${eyebrowOuterY}`} stroke="rgba(124, 96, 72, 0.55)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
                    <ellipse cx="24" cy="40" rx="5" ry={String(Math.max(2.2, eyeOpen))} fill="rgba(114, 93, 75, 0.58)" />
                    <ellipse cx="50" cy="40" rx="5" ry={String(Math.max(2.2, eyeOpen))} fill="rgba(114, 93, 75, 0.58)" />
                    <path d={`M 25 60 Q 37 ${mouthControlY} 49 60`} stroke="rgba(201, 177, 145, 0.95)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  </>
                )}
              </svg>
            </div>

            <div
              className="absolute top-[102px] h-[44px] w-[16px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#f9f2e6,#dcc7ac)] shadow-sm transition-all duration-700"
              style={{ left: `calc(50% + ${Math.round(8 * postureCurve * postureCurve)}px)` }}
            />

            <div className="absolute top-[146px] h-[150px] w-[188px]" style={{ left: '50%', transform: 'translateX(-50%)' }}>
              <div
                className="absolute top-0 h-[142px] w-[30px] rounded-[999px] bg-[linear-gradient(180deg,#f8f1e5,#d9c4a7)] shadow-[0_22px_50px_-26px_rgba(15,23,42,0.32)] transition-all duration-700"
                style={{ left: '50%', transform: `translateX(calc(-50% + ${Math.round(6 * postureCurve)}px))` }}
              />
              {ribOffsets.map((offset, index) => (
                <div
                  key={`rib-left-${index}`}
                  className="absolute right-1/2 h-[16px] w-[76px] origin-right rounded-l-[999px] border border-[#e6d7bf] border-r-0 bg-[linear-gradient(180deg,#fffaf1,#e5d5bc)] opacity-95 transition-all duration-700"
                  style={{
                    top: `${18 + index * 18}px`,
                    transform: `translateX(${Math.round(offset - 10 * postureCurve)}px) rotate(${Number((-4 * postureCurve).toFixed(1))}deg)`,
                  }}
                />
              ))}
              {ribOffsets.map((offset, index) => (
                <div
                  key={`rib-right-${index}`}
                  className="absolute left-1/2 h-[16px] w-[76px] origin-left rounded-r-[999px] border border-[#e6d7bf] border-l-0 bg-[linear-gradient(180deg,#fffaf1,#e5d5bc)] opacity-95 transition-all duration-700"
                  style={{
                    top: `${18 + index * 18}px`,
                    transform: `translateX(${Math.round(Math.abs(offset) + 8 * postureCurve)}px) rotate(${Number((4 * postureCurve).toFixed(1))}deg)`,
                  }}
                />
              ))}
            </div>

            <div
              className="absolute top-[170px] z-10 flex h-[230px] w-[156px] flex-col items-center justify-center gap-2 transition-all duration-700"
              style={{ left: '50%', transform: `translateX(calc(-50% + ${Math.round(3 * postureCurve)}px))` }}
            >
              {vertebrae.map((segment) => (
                <div
                  key={segment.id}
                  className="rounded-[999px] border border-white/80 bg-[linear-gradient(180deg,#ffffff,#d4f7eb)] transition-transform duration-700"
                  style={{
                    width: `${segment.width}px`,
                    height: `${Math.round(segment.width * 0.52)}px`,
                    transform: `translateX(${segment.x}px) rotate(${segment.rotate}deg)`,
                    boxShadow: `0 18px 40px -20px rgba(15,23,42,0.38), 0 0 ${Math.round(segment.glow * 18)}px rgba(16,185,129,${segment.glow})`,
                  }}
                />
              ))}
            </div>

            <div className="absolute top-[404px] h-[84px] w-[156px] transition-all duration-700" style={{ left: '50%', transform: `translateX(calc(-50% + ${Math.round(4 * postureCurve)}px))` }}>
              <div className="absolute left-0 top-[18px] h-[52px] w-[74px] rounded-[46%_54%_42%_58%/54%_56%_44%_46%] border border-[#e2d3bc] bg-[linear-gradient(180deg,#fff9ef,#e1cfb6)] shadow-[0_20px_45px_-28px_rgba(15,23,42,0.3)]" />
              <div className="absolute right-0 top-[18px] h-[52px] w-[74px] rounded-[54%_46%_58%_42%/56%_54%_46%_44%] border border-[#e2d3bc] bg-[linear-gradient(180deg,#fff9ef,#e1cfb6)] shadow-[0_20px_45px_-28px_rgba(15,23,42,0.3)]" />
              <div className="absolute left-1/2 top-0 h-[72px] w-[18px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#f8f1e5,#d9c4a7)]" />
            </div>

            <div className="absolute bottom-[132px] h-[120px] w-[18px] rounded-full bg-[linear-gradient(180deg,#f7f0e4,#d7c2a4)] opacity-95 transition-transform duration-700" style={{ left: 'calc(50% - 38px)', transform: `rotate(${Number((-6 * postureCurve).toFixed(1))}deg)` }} />
            <div className="absolute bottom-[132px] h-[120px] w-[18px] rounded-full bg-[linear-gradient(180deg,#f7f0e4,#d7c2a4)] opacity-95 transition-transform duration-700" style={{ left: 'calc(50% + 20px)', transform: `rotate(${Number((4 * postureCurve).toFixed(1))}deg)` }} />
            <div className="absolute bottom-0 h-[8.2rem] w-[16px] rounded-full bg-[linear-gradient(180deg,#f7f0e4,#d7c2a4)] opacity-95" style={{ left: 'calc(50% - 33px)' }} />
            <div className="absolute bottom-0 h-[8.2rem] w-[16px] rounded-full bg-[linear-gradient(180deg,#f7f0e4,#d7c2a4)] opacity-95" style={{ left: 'calc(50% + 17px)' }} />
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-500">Simulador dinamico para representar la acumulacion de tension durante la jornada.</p>
        </div>
      </section>

      <section className="mt-12 grid gap-8 rounded-[2.6rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-[0_45px_130px_-60px_rgba(15,23,42,0.9)] sm:p-10 lg:grid-cols-[1fr_1fr] lg:p-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Empresas</p>
          <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight sm:text-5xl">
            Bienestar empresarial con foco preventivo y terapeutico.
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/72">
            Pausas activas, jornadas de masajes y apoyo preventivo para oficinas, bodegas, conductores y otras realidades laborales.
          </p>
          <Button asChild className="mt-6 rounded-full bg-white text-slate-900 hover:bg-emerald-100">
            <Link to="/empresas">Ver propuesta para empresas</Link>
          </Button>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-white/15">
              <img
                src={getServiceHeroImage('bienestar-empresarial')}
                alt={getServiceImageAlt('bienestar-empresarial', 'Bienestar empresarial')}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-white/15">
              <img
                src={getServiceHeroImage('pausas-activas')}
                alt={getServiceImageAlt('pausas-activas', 'Pausas activas')}
                className="h-40 w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {companyHighlights.map((highlight) => (
            <article
              key={highlight.title}
              className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.13),rgba(255,255,255,0.05))] p-5 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-slate-100', highlight.accent)}>
                  <highlight.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                  {highlight.label}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-6 text-white">{highlight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/72">{highlight.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Strip Nosotros */}
      <section className="mt-12 overflow-hidden rounded-[2.2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[260px] overflow-hidden">
            <img
              src="/assets/about/equipo-amaur-salud.webp"
              alt="Equipo de profesionales AMAUR en sesión clínica"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.42))]" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Nosotros</p>
            <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl leading-tight text-slate-950 sm:text-4xl">
              Nació de preguntarse por qué esperar a que duela.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Somos un equipo de kinesiólogos, terapeutas ocupacionales y masoterapeútas que trabajan con un mismo criterio
              clínico: atender bien, adaptar el formato y sostener los resultados en el tiempo.
            </p>
            <Link
              to="/nosotros"
              className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900 hover:text-emerald-700"
            >
              Conocer el equipo
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="mt-12">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Testimonios</p>
          <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl text-slate-950 sm:text-4xl">
            Lo que dicen quienes ya trabajan con nosotros.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {data.testimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="relative overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <Quote className="h-8 w-8 text-emerald-200" aria-hidden="true" />
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {testimonial.quote}
              </p>
              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{testimonial.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-12">
        <FaqList faqs={homeFaqs} />
      </div>

      {/* Preview blog */}
      {data.posts.filter((post) => post.status === 'published').length > 0 && (
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Blog</p>
              <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-3xl text-slate-950 sm:text-4xl">
                Contenido que sí te sirve.
              </h2>
            </div>
            <Link
              to="/blog"
              className="hidden shrink-0 items-center text-sm font-semibold text-slate-900 hover:text-emerald-700 sm:inline-flex"
            >
              Ver todos los artículos
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.posts
              .filter((post) => post.status === 'published')
              .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
              .slice(0, 3)
              .map((post) => {
                const category = data.categories.find((item) => item.slug === post.categorySlug)
                return (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {post.coverImage ? (
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.0),rgba(15,23,42,0.28))]" />
                      </div>
                    ) : (
                      <div className="h-44 bg-[linear-gradient(135deg,#f0faf5,#e8f5ee)]" />
                    )}
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        {category?.name ?? 'Blog AMAUR'}
                      </p>
                      <h3 className="mt-2 text-base font-semibold leading-snug text-slate-950 group-hover:text-emerald-700 transition-colors">
                        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{post.excerpt}</p>
                      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString('es-CL')}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3 w-3" />
                          {post.readingMinutes} min
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })}
          </div>

          <Link
            to="/blog"
            className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900 hover:text-emerald-700 sm:hidden"
          >
            Ver todos los artículos
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </section>
      )}

      <div className="mt-12">
        <CtaBanner
          title="Agenda o cotiza en minutos"
          description="Te ayudamos a elegir el servicio correcto para tu necesidad personal o empresarial."
          primaryLabel="Ir a contacto"
          primaryHref="/contacto"
          secondaryLabel="Explorar blog"
          secondaryHref="/blog"
        />
      </div>
    </>
  )
}

