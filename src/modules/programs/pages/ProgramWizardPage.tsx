import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/utils/cn'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { useContracts } from '@/modules/contracts/hooks/useContracts'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { useWorkers, useWorkerAvailability } from '@/modules/workers/hooks/useWorkers'
import { useCreateProgram } from '../hooks/usePrograms'
import { programsApi } from '../api/programsApi'
import type { AvailabilityRuleDTO } from '@/modules/workers/api/workersApi'
import { toast } from 'sonner'

// ─── Types ───────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
]

type RuleData = {
  weekday: number
  start_time: string
  duration_minutes: number
  frequency_interval_weeks: number
  max_occurrences: number | ''
  worker_id: string // planning only, not persisted in rule
}

type WizardData = {
  companyId: string
  companyName: string
  contractId: string
  contractName: string
  serviceTypeId: string
  serviceTypeName: string
  durationMinutes: number
  programName: string
  startDate: string
  endDate: string
  rules: RuleData[]
  notes: string
}

const EMPTY_RULE: RuleData = {
  weekday: 1,
  start_time: '09:00',
  duration_minutes: 60,
  frequency_interval_weeks: 1,
  max_occurrences: '',
  worker_id: '',
}

const INITIAL: WizardData = {
  companyId: '',
  companyName: '',
  contractId: '',
  contractName: '',
  serviceTypeId: '',
  serviceTypeName: '',
  durationMinutes: 60,
  programName: '',
  startDate: '',
  endDate: '',
  rules: [],
  notes: '',
}

const STEPS = [
  { num: 1, label: 'Empresa' },
  { num: 2, label: 'Servicio' },
  { num: 3, label: 'Horario' },
  { num: 4, label: 'Confirmar' },
]

// ─── Availability indicator sub-component ─────────────────────────────────

function AvailabilityIndicator({
  workerId,
  weekday,
  startTime,
}: {
  workerId: string
  weekday: number
  startTime: string
}) {
  const { data: rulesRaw, isLoading, isError } = useWorkerAvailability(workerId)

  if (!workerId) return null
  if (isLoading) return <p className="text-xs text-muted-foreground">Verificando disponibilidad...</p>
  // If there was an error (e.g. 403 permission denied) don't show a misleading "no schedule" warning
  if (isError || rulesRaw === undefined) return null

  const rules = rulesRaw ?? []

  if (rules.length === 0) {
    return (
      <div className="flex items-center gap-1 text-amber-600 text-xs">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        <span>
          Este profesional no tiene horario configurado.{' '}
          <span className="underline">Configure su horario en el perfil del profesional antes de asignarlo.</span>
        </span>
      </div>
    )
  }

  const [h, m] = startTime.split(':').map(Number)
  const startMin = h * 60 + m

  const isAvailable = rules.some((r: AvailabilityRuleDTO) => {
    if (r.weekday !== weekday || !r.is_active) return false
    const [fh, fm] = r.start_time.split(':').map(Number)
    const [th, tm] = r.end_time.split(':').map(Number)
    return startMin >= fh * 60 + fm && startMin < th * 60 + tm
  })

  const dayRules = rules.filter((r: AvailabilityRuleDTO) => r.weekday === weekday && r.is_active)

  if (dayRules.length === 0) {
    return (
      <div className="flex items-center gap-1 text-amber-600 text-xs">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        <span>El profesional no trabaja los {WEEKDAY_LABELS[weekday]}</span>
      </div>
    )
  }

  if (!isAvailable) {
    const ranges = dayRules.map((r: AvailabilityRuleDTO) => `${r.start_time}–${r.end_time}`).join(', ')
    return (
      <div className="flex items-center gap-1 text-amber-600 text-xs">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        <span>Hora fuera de horario (disponible {ranges})</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-green-600 text-xs">
      <Check className="h-3 w-3 shrink-0" />
      <span>Disponible los {WEEKDAY_LABELS[weekday]} a las {startTime}</span>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProgramWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(INITIAL)
  const createMutation = useCreateProgram()

  // Queries
  const { data: companiesData } = useCompanies({ limit: 200 })
  const companies = companiesData?.data ?? []

  const { data: contractsData } = useContracts(
    data.companyId ? { company_id: data.companyId, limit: 50 } : undefined,
  )
  const contracts = contractsData?.data ?? []

  const { data: serviceTypes = [] } = useServiceTypes(true)
  const groupServiceTypes = serviceTypes.filter((st) => st.is_group_service)

  const { data: workersData } = useWorkers({ active: true, limit: 200 })
  const workers = workersData?.data ?? []

  // Reset contract when company changes
  useEffect(() => {
    setData((prev) => ({ ...prev, contractId: '', contractName: '' }))
  }, [data.companyId])

  function patch(updates: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...updates }))
  }

  function updateRule(idx: number, field: keyof RuleData, value: unknown) {
    setData((prev) => ({
      ...prev,
      rules: prev.rules.map((r, i) => (i === idx ? { ...r, [field]: value } : r)),
    }))
  }

  function addRule() {
    setData((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        { ...EMPTY_RULE, duration_minutes: prev.durationMinutes },
      ],
    }))
  }

  function removeRule(idx: number) {
    setData((prev) => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== idx),
    }))
  }

  function canProceed(): boolean {
    if (step === 1) return !!data.companyId && !!data.contractId
    if (step === 2) return !!data.serviceTypeId && !!data.programName.trim() && !!data.startDate
    if (step === 3) return data.rules.length > 0
    return true
  }

  async function handleSubmit() {
    try {
      const created = await createMutation.mutateAsync({
        company_id: data.companyId,
        contract_id: data.contractId,
        name: data.programName.trim(),
        start_date: data.startDate,
        end_date: data.endDate || undefined,
        notes: data.notes || undefined,
        rules: data.rules.map((r) => ({
          weekday: r.weekday,
          start_time: r.start_time,
          duration_minutes: r.duration_minutes,
          frequency_interval_weeks: r.frequency_interval_weeks,
          max_occurrences:
            r.max_occurrences !== '' && r.max_occurrences != null
              ? Number(r.max_occurrences)
              : undefined,
          service_type_id: data.serviceTypeId,
          worker_id: r.worker_id || undefined,
        })),
      })
      // Auto-generate agendas immediately so they show up in the worker calendar
      try {
        const gen = await programsApi.generateAgendas(created.id)
        toast.success(`Programa creado con ${gen.count} sesión(es) generada(s).`)
      } catch {
        toast.error('Programa creado, pero falló la generación de sesiones. Usa "Regenerar agendas" desde el detalle.')
      }
      navigate(`/programs/${created.id}`)
    } catch {
      toast.error('Error al crear el programa')
    }
  }

  // ─── Step renderers ──────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <div className="space-y-5">
        <div>
          <Label className="mb-1 block">Empresa *</Label>
          <Select
            value={data.companyId || 'none'}
            onValueChange={(v) => {
              const co = companies.find((c) => c.id === v)
              patch({
                companyId: v === 'none' ? '' : v,
                companyName: co?.name ?? '',
              })
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona empresa..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Selecciona empresa...</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {(c as { fantasy_name?: string }).fantasy_name
                    ? `${(c as { fantasy_name: string }).fantasy_name} (${c.name})`
                    : c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block">Contrato *</Label>
          <Select
            value={data.contractId || 'none'}
            onValueChange={(v) => {
              const co = contracts.find((c) => c.id === v)
              patch({
                contractId: v === 'none' ? '' : v,
                contractName: (co as { name?: string })?.name ?? '',
              })
            }}
            disabled={!data.companyId}
          >
            <SelectTrigger>
              <SelectValue placeholder={data.companyId ? 'Selecciona contrato...' : 'Primero selecciona empresa'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Selecciona contrato...</SelectItem>
              {contracts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {(c as { name?: string }).name ?? c.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {data.companyId && contracts.length === 0 && (
            <p className="mt-1 text-xs text-amber-600">
              No hay contratos para esta empresa. Crea uno antes de continuar.
            </p>
          )}
        </div>
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className="space-y-5">
        <div>
          <Label className="mb-3 block font-medium">Tipo de servicio (grupal) *</Label>
          {groupServiceTypes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay tipos de servicio grupales configurados. Configúralos en{' '}
              <strong>Tipos de servicio</strong>.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {groupServiceTypes.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() =>
                    patch({
                      serviceTypeId: st.id,
                      serviceTypeName: st.name,
                      durationMinutes: st.default_duration_minutes ?? 60,
                      programName: data.programName || st.name,
                    })
                  }
                  className={cn(
                    'rounded-lg border p-4 text-left transition-all',
                    data.serviceTypeId === st.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'hover:border-primary/40 hover:bg-muted',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium leading-tight">{st.name}</span>
                    {data.serviceTypeId === st.id && (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                  {st.category && (
                    <Badge variant="outline" className="mt-1 text-xs">{st.category}</Badge>
                  )}
                  {st.default_duration_minutes && (
                    <p className="mt-2 text-xs text-muted-foreground">{st.default_duration_minutes} min / sesión</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div>
          <Label className="mb-1 block">Nombre del programa *</Label>
          <Input
            value={data.programName}
            onChange={(e) => patch({ programName: e.target.value })}
            placeholder="Ej: Programa kinesiología Q1 2026"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1 block">Fecha de inicio *</Label>
            <Input
              type="date"
              value={data.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </div>
          <div>
            <Label className="mb-1 block">Fecha de fin</Label>
            <Input
              type="date"
              value={data.endDate}
              onChange={(e) => patch({ endDate: e.target.value })}
            />
          </div>
        </div>
      </div>
    )
  }

  function renderStep3() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Define cuándo y quién ejecuta cada bloque del programa.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addRule}>
            <Plus className="h-4 w-4 mr-1" /> Agregar bloque
          </Button>
        </div>

        {data.rules.length === 0 && (
          <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            Sin bloques. Agrega al menos uno para generar sesiones.
          </div>
        )}

        {data.rules.map((rule, idx) => (
          <div key={idx} className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Bloque {idx + 1}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(idx)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            {/* Schedule fields */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <Label className="mb-1 block text-xs">Día de semana</Label>
                <Select
                  value={String(rule.weekday)}
                  onValueChange={(v) => updateRule(idx, 'weekday', Number(v))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAY_LABELS.map((label, d) => (
                      <SelectItem key={d} value={String(d)}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Hora inicio</Label>
                <Input
                  type="time"
                  value={rule.start_time}
                  onChange={(e) => updateRule(idx, 'start_time', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Duración (min)</Label>
                <Input
                  type="number"
                  min={15}
                  step={5}
                  value={rule.duration_minutes}
                  onChange={(e) => updateRule(idx, 'duration_minutes', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Frecuencia (semanas)</Label>
                <Select
                  value={String(rule.frequency_interval_weeks)}
                  onValueChange={(v) => updateRule(idx, 'frequency_interval_weeks', Number(v))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semanal</SelectItem>
                    <SelectItem value="2">Quincenal</SelectItem>
                    <SelectItem value="4">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1 block text-xs">Nº sesiones (dejar vacío = sin límite)</Label>
                <Input
                  type="number"
                  min={1}
                  value={rule.max_occurrences ?? ''}
                  onChange={(e) =>
                    updateRule(
                      idx,
                      'max_occurrences',
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                  placeholder="∞"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <Separator />

            {/* Professional assignment */}
            <div>
              <Label className="mb-1 block text-xs">Profesional asignado (planificación)</Label>
              <Select
                value={rule.worker_id || 'none'}
                onValueChange={(v) => updateRule(idx, 'worker_id', v === 'none' ? '' : v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.first_name} {w.last_name}
                      {w.role_title ? ` — ${w.role_title}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {rule.worker_id && (
                <div className="mt-2">
                  <AvailabilityIndicator
                    workerId={rule.worker_id}
                    weekday={rule.weekday}
                    startTime={rule.start_time}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  function renderStep4() {
    const assignedWorkers = data.rules
      .map((r) => workers.find((w) => w.id === r.worker_id))
      .filter(Boolean)
    const uniqueWorkers = Array.from(new Map(assignedWorkers.map((w) => [w!.id, w!])).values())

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen del programa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Empresa</span>
              <span className="font-medium">{data.companyName}</span>
            </div>
            <Separator />
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Servicio</span>
              <span className="font-medium">{data.serviceTypeName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Programa</span>
              <span className="font-medium">{data.programName}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Período</span>
              <span className="font-medium">
                {data.startDate}
                {data.endDate ? ` → ${data.endDate}` : ' (sin fecha fin)'}
              </span>
            </div>
            <Separator />
            <div>
              <span className="text-muted-foreground">Bloques de sesión ({data.rules.length})</span>
              <ul className="mt-2 space-y-1">
                {data.rules.map((r, i) => {
                  const w = workers.find((x) => x.id === r.worker_id)
                  const freq =
                    r.frequency_interval_weeks === 1
                      ? 'Semanal'
                      : r.frequency_interval_weeks === 2
                        ? 'Quincenal'
                        : 'Mensual'
                  return (
                    <li key={i} className="text-xs text-muted-foreground">
                      {WEEKDAY_LABELS[r.weekday]} {r.start_time} · {r.duration_minutes} min · {freq}
                      {r.max_occurrences ? ` · ${r.max_occurrences} sesiones` : ''}
                      {w ? ` · ${w.first_name} ${w.last_name}` : ''}
                    </li>
                  )
                })}
              </ul>
            </div>
            {uniqueWorkers.length > 0 && (
              <>
                <Separator />
                <div>
                  <span className="text-muted-foreground">Profesionales planificados</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {uniqueWorkers.map((w) => (
                      <Badge key={w.id} variant="secondary" className="text-xs">
                        {w.first_name} {w.last_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <strong>Nota:</strong> Los profesionales se confirman y asignan sesión a sesión desde el
          detalle del programa, una vez creado.
        </p>

        <div>
          <Label className="mb-1 block">Notas del programa (opcional)</Label>
          <Textarea
            placeholder="Indicaciones generales, objetivos del programa..."
            rows={4}
            value={data.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creando programa...' : 'Crear programa'}
        </Button>
      </div>
    )
  }

  function renderCurrentStep() {
    switch (step) {
      case 1: return renderStep1()
      case 2: return renderStep2()
      case 3: return renderStep3()
      case 4: return renderStep4()
      default: return null
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Nuevo programa"
        description="Planifica un programa de atención grupal para empresa"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/programs')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>
        }
      />

      {/* Stepper */}
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                  step === s.num
                    ? 'border-primary bg-primary text-primary-foreground'
                    : step > s.num
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {step > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={cn(
                  'text-xs',
                  step >= s.num ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 mb-4 flex-1 border-t-2',
                  step > s.num ? 'border-primary' : 'border-muted-foreground/20',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{STEPS[step - 1].label}</CardTitle>
        </CardHeader>
        <CardContent>{renderCurrentStep()}</CardContent>
      </Card>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
