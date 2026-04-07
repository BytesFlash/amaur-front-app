import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  HeartHandshake,
  Menu,
  Sparkles,
  Stethoscope,
  Waves,
  X,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/utils/cn'
import { useAuthStore } from '@/app/stores/authStore'

const navItems = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Bienestar', href: '#bienestar' },
  { label: 'Empresas', href: '#empresas' },
  { label: 'Portal', href: '#portal' },
]

const services = [
  {
    title: 'Terapia ocupacional',
    short: 'Volver a hacer con mayor autonomia y confianza.',
    detail: 'Ayuda a recuperar funcionalidad, organizar rutinas y retomar actividades importantes.',
    everyday: 'Hace que tareas como trabajar, moverse o sostener una rutina vuelvan a sentirse posibles.',
    icon: HeartHandshake,
    accent: 'from-emerald-500/20 to-cyan-500/10',
  },
  {
    title: 'Kinesiologia',
    short: 'Movilidad, rehabilitacion y prevencion con foco real.',
    detail: 'Pensada para dolor, rigidez, lesiones o desgaste fisico, y tambien para prevenir.',
    everyday: 'Ayuda a disminuir dolor, recuperar movilidad y volver a moverse con mas seguridad.',
    icon: Activity,
    accent: 'from-sky-500/20 to-teal-500/10',
  },
  {
    title: 'Masajes terapeuticos',
    short: 'Relajar, soltar y descargar tension acumulada.',
    detail: 'Sesiones de relajacion y descontracturantes para personas con alta carga muscular.',
    everyday: 'Puede hacer que el cuerpo se sienta mas liviano y que el descanso mejore.',
    icon: Waves,
    accent: 'from-amber-400/20 to-orange-500/10',
  },
  {
    title: 'Ergonometria',
    short: 'Entender como el cuerpo responde al puesto y al esfuerzo.',
    detail: 'Analiza postura, carga, repeticion y movimiento para detectar sobrecarga.',
    everyday: 'Sirve para prevenir dolor de espalda, cuello, hombro o fatiga sostenida.',
    icon: Sparkles,
    accent: 'from-violet-500/15 to-emerald-500/10',
  },
  {
    title: 'Bienestar empresarial',
    short: 'Programas para equipos que quieren sentirse mejor y sostenerlo.',
    detail: 'Acciones de bienestar, pausas activas, acompanamiento y experiencias para empresas.',
    everyday: 'Puede traducirse en equipos mas cuidados y una experiencia laboral mas humana.',
    icon: BriefcaseBusiness,
    accent: 'from-emerald-600/20 to-lime-400/10',
  },
]

const stressMessages = [
  { min: 0, max: 24, label: 'Carga baja', note: 'Hay mejor alineacion y menos compensacion corporal.' },
  { min: 25, max: 49, label: 'Alerta temprana', note: 'Empiezan a aparecer rigidez y cansancio muscular.' },
  { min: 50, max: 74, label: 'Sobrecarga diaria', note: 'La postura compensa mas: espalda cargada y menos movilidad.' },
  { min: 75, max: 100, label: 'Alta tension', note: 'Aumenta la sensacion de dolor, fatiga y desorden postural.' },
]

const companyPoints = [
  'Atencion cercana para personas, lideres y equipos completos.',
  'Servicios terapeuticos y preventivos conectados entre si.',
  'Programas corporativos con criterio clinico, humano y operativo.',
  'Acciones que buscan aliviar, prevenir y sostener bienestar real.',
]

const portalFeatures = [
  'Agendar horas de manera mas simple',
  'Revisar historial clinico y seguimiento',
  'Tener continuidad entre sesiones, indicaciones y avances',
]

export function LandingPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stressLevel, setStressLevel] = useState(64)
  const [activeService, setActiveService] = useState(services[0].title)
  const appHref = isAuthenticated ? '/app/dashboard' : '/login'

  const activeServiceData = services.find((service) => service.title === activeService) ?? services[0]
  const postureCurve = stressLevel / 100
  const expressionCurve = Math.min(stressLevel, 94) / 94
  const isComicCollapse = stressLevel >= 95
  const eyeOpen = Number((5.8 - expressionCurve * 2.4).toFixed(1))
  const eyebrowOuterY = Number((24 + expressionCurve * 4).toFixed(1))
  const eyebrowInnerY = Number((21 + expressionCurve * 15).toFixed(1))
  const mouthControlY = Number((68 - expressionCurve * 30).toFixed(1))
  const stressState =
    stressMessages.find((item) => stressLevel >= item.min && stressLevel <= item.max) ?? stressMessages[2]
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.17),_transparent_38%),linear-gradient(180deg,_#f8f5eb_0%,_#f4efe2_32%,_#fcfbf6_100%)] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-900/10 bg-[#f8f5eb]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#22c55e)] text-white shadow-lg shadow-emerald-900/20">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold uppercase tracking-[0.22em] text-slate-700">AMAUR</p>
              <p className="text-xs text-slate-500">Terapias, ergonomia y bienestar</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button variant="ghost" asChild className="rounded-full px-5 text-slate-700">
              <Link to="/login">Acceso interno</Link>
            </Button>
            <Button asChild className="rounded-full bg-slate-950 px-5 text-white hover:bg-slate-800">
              <Link to={appHref}>{isAuthenticated ? 'Ir al portal' : 'Portal pacientes y equipo'}</Link>
            </Button>
          </div>

          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-900/10 bg-white/70 text-slate-700 lg:hidden" onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-900/10 bg-[#f8f5eb] lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white/80" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-white/75 px-4 py-2 text-sm text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Salud, recuperacion y bienestar con acompanamiento real
            </div>
            <h1 className="mt-6 max-w-3xl font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-5xl leading-[0.95] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              AMAUR ayuda a que el cuerpo vuelva a sentirse mas liviano, mas alineado y mas habitable.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Terapia ocupacional, kinesiologia, masajes terapeuticos, ergonomia y bienestar empresarial para personas que necesitan alivio y equipos que quieren cuidarse mejor.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full bg-slate-950 px-7 text-white hover:bg-slate-800">
                <a href="#servicios">Quiero conocer los servicios<ArrowRight className="h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-slate-300 bg-white/70 px-7 text-slate-700 hover:bg-white">
                <a href="#bienestar">Ver simulador corporal<ChevronRight className="h-4 w-4" /></a>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
                <p className="text-sm text-slate-500">Terapias</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">5</p>
                <p className="mt-1 text-sm text-slate-600">areas de atencion complementarias</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
                <p className="text-sm text-slate-500">Foco</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">360</p>
                <p className="mt-1 text-sm text-slate-600">personas, rutinas y equipos</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/70 bg-white/70 p-5 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
                <p className="text-sm text-slate-500">Objetivo</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">Alivio</p>
                <p className="mt-1 text-sm text-slate-600">mas movimiento y mejor disposicion diaria</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[2.3rem] border border-white/80 bg-white/72 p-6 shadow-[0_45px_120px_-50px_rgba(15,23,42,0.6)] backdrop-blur-xl sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">AMAUR</p>
              <h2 className="mt-3 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight text-slate-950">
                Cuidado terapeutico para personas y soluciones de bienestar para empresas.
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600">
                La primera impresion tiene que mostrar algo simple: aqui hay criterio clinico, cercania humana y una forma de acompanar que busca mejorar como se siente el cuerpo en la vida real.
              </p>
            </div>

            <div className="mt-8 grid gap-4">
              <div className="rounded-[1.6rem] bg-slate-950 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-200/75">lo que trabaja AMAUR</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {services.map((service) => (
                    <span key={service.title} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/82">
                      {service.title}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff,#f1fbf7)] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">personas</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    Atencion enfocada en alivio, movimiento, funcionalidad y una vida diaria mas llevadera.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(180deg,#ffffff,#f1fbf7)] p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">empresas</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    Programas de bienestar y ergonomia para equipos que quieren trabajar mejor y sentirse mejor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Servicios</p>
              <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight text-slate-950 sm:text-5xl">
                Cada servicio tiene un impacto distinto en la vida diaria. Aqui lo mostramos de forma clara, cercana y util.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Explora cada area y descubre como puede ayudarte a aliviar dolor, recuperar movimiento, mejorar funcionalidad o cuidar mejor a tu equipo.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                {services.map((service) => (
                  <button key={service.title} type="button" onMouseEnter={() => setActiveService(service.title)} onFocus={() => setActiveService(service.title)} onClick={() => setActiveService(service.title)} className={cn('w-full rounded-[1.6rem] border px-5 py-5 text-left transition-all duration-300', activeService === service.title ? 'border-emerald-300 bg-white shadow-[0_22px_70px_-35px_rgba(5,150,105,0.35)]' : 'border-slate-900/10 bg-white/70 hover:bg-white')}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-slate-900', service.accent)}>
                          <service.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-slate-950">{service.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{service.short}</p>
                        </div>
                      </div>
                      <ChevronRight className={cn('h-4 w-4 shrink-0 text-slate-400 transition-transform', activeService === service.title && 'translate-x-1 text-emerald-700')} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="rounded-[2rem] border border-slate-900/10 bg-white/78 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
                <div className={cn('flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br text-slate-900', activeServiceData.accent)}>
                  <activeServiceData.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-slate-950">{activeServiceData.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{activeServiceData.detail}</p>
                <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(180deg,#f5fbf8,#eef9f5)] p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-emerald-700">como puede mejorar tu vida</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{activeServiceData.everyday}</p>
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-slate-900/8 bg-white p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">cuando suele hacer sentido</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Cuando una molestia se repite, cuando el cuerpo empieza a pedir ayuda, cuando una rutina ya no se sostiene igual o cuando una empresa quiere prevenir antes de llegar al desgaste.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="bienestar" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 rounded-[2.6rem] border border-slate-900/10 bg-white/78 p-8 shadow-[0_45px_130px_-60px_rgba(15,23,42,0.22)] backdrop-blur sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200/75">simulador de carga diaria</p>
              <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight">
                A veces el malestar no aparece de golpe. Se va acumulando durante el dia.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/72">
                Mueve el nivel de estres y observa como cambia la referencia de la columna. La idea es representar visualmente como la sobrecarga, la rigidez y la fatiga pueden alterar la percepcion corporal.
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
                        <path
                          d="M 33 58 Q 37 64 41 58 L 41 72 Q 37 80 33 72 Z"
                          fill="rgba(241, 128, 128, 0.9)"
                          stroke="rgba(220, 94, 94, 0.55)"
                          strokeWidth="1.2"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d={`M 16 ${eyebrowOuterY} Q 22 ${Number((eyebrowOuterY - 2.5).toFixed(1))} 30 ${eyebrowInnerY}`}
                          stroke="rgba(124, 96, 72, 0.55)"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d={`M 44 ${eyebrowInnerY} Q 52 ${Number((eyebrowOuterY - 2.5).toFixed(1))} 58 ${eyebrowOuterY}`}
                          stroke="rgba(124, 96, 72, 0.55)"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <ellipse cx="24" cy="40" rx="5" ry={String(Math.max(2.2, eyeOpen))} fill="rgba(114, 93, 75, 0.58)" />
                        <ellipse cx="50" cy="40" rx="5" ry={String(Math.max(2.2, eyeOpen))} fill="rgba(114, 93, 75, 0.58)" />
                        <path
                          d={`M 25 60 Q 37 ${mouthControlY} 49 60`}
                          stroke="rgba(201, 177, 145, 0.95)"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          fill="none"
                        />
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
                  style={{
                    left: '50%',
                    transform: `translateX(calc(-50% + ${Math.round(3 * postureCurve)}px))`,
                  }}
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

                <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1rem] border border-emerald-100 bg-white/90 p-3 text-xs leading-5 text-slate-600">
                    Menor carga: mejor eje corporal, menos compensacion y mas sensacion de estabilidad.
                  </div>
                  <div className="rounded-[1rem] border border-emerald-100 bg-white/90 p-3 text-xs leading-5 text-slate-600">
                    Mayor carga: mas rigidez, peor postura y una percepcion de fatiga mas marcada.
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs leading-6 text-slate-500">
                Version semi-realista construida solo con codigo para explorar una direccion visual mas organica.
              </p>
            </div>
          </div>
        </section>

        <section id="empresas" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 rounded-[2.6rem] border border-slate-900/10 bg-slate-950 p-8 text-white shadow-[0_45px_130px_-60px_rgba(15,23,42,0.95)] sm:p-10 lg:grid-cols-[1fr_1fr] lg:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Bienestar y empresas</p>
              <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight sm:text-5xl">
                Lo que realmente importa es el cambio que una persona o un equipo puede sentir despues.
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/72">
                Menos dolor, mas alivio, mejor movilidad, mayor autonomia y una mejor disposicion para vivir y trabajar. AMAUR no solo entrega prestaciones: acompana procesos de bienestar que se notan en el cuerpo, en la rutina y en la experiencia diaria.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {companyPoints.map((point) => (
                <div key={point} className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5 text-sm leading-7 text-white/76">{point}</div>
              ))}
            </div>
          </div>
        </section>

        <section id="portal" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-6 rounded-[2.4rem] border border-slate-900/10 bg-white/70 p-8 shadow-[0_24px_90px_-45px_rgba(15,23,42,0.4)] backdrop-blur sm:p-10 lg:grid-cols-[0.96fr_1.04fr] lg:p-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">Portal pacientes</p>
              <h2 className="mt-4 font-['Georgia','Iowan_Old_Style','Palatino_Linotype',serif] text-4xl leading-tight text-slate-950 sm:text-5xl">
                La plataforma puede sentirse como una continuidad natural del acompanamiento.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                Para el paciente, no se trata de “usar un sistema”. Se trata de tener sus horas, su historial y su seguimiento en un solo lugar, con mas claridad y mas tranquilidad durante su proceso.
              </p>
            </div>

            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.24em] text-white/50">Una experiencia simple para pacientes</p>
              <div className="mt-5 grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
                <div className="flex items-end justify-center rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.18),_transparent_38%),linear-gradient(180deg,#142129,#0b141a)] p-4">
                  <div className="w-full max-w-[180px] rounded-[2rem] border border-white/10 bg-[#0f1720] p-3 shadow-2xl">
                    <div className="rounded-[1.5rem] bg-white/5 p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[linear-gradient(180deg,#f6d58f,#dca24c)]" />
                        <div>
                          <p className="text-sm font-semibold text-white">Mi portal</p>
                          <p className="text-[11px] text-white/55">Paciente AMAUR</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="rounded-xl bg-emerald-400/15 px-3 py-2 text-[11px] text-emerald-100">Proxima cita: martes 18:30</div>
                        <div className="rounded-xl bg-white/6 px-3 py-2 text-[11px] text-white/75">Historial y sesiones</div>
                        <div className="rounded-xl bg-white/6 px-3 py-2 text-[11px] text-white/75">Indicaciones y avances</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,#142129,#0b141a)] p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-[linear-gradient(180deg,#f6d58f,#dca24c)]" />
                      <div>
                        <p className="text-sm font-semibold">Paciente AMAUR</p>
                        <p className="text-xs text-white/55">Mas orden, mas continuidad, menos friccion</p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      {portalFeatures.map((feature) => (
                        <div key={feature} className="rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/82">{feature}</div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-[1.2rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4">
                      <p className="text-sm text-emerald-100">
                        “Siento que mi proceso esta mas claro, porque tengo mi informacion y mis proximos pasos siempre a mano.”
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-full bg-white px-6 text-slate-950 hover:bg-emerald-50">
                  <Link to={appHref}>{isAuthenticated ? 'Entrar al portal' : 'Acceso a plataforma'}<ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
