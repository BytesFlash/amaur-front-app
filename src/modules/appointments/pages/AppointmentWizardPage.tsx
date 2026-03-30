import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
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
import { usePatients, usePatientWards } from '@/modules/patients/hooks/usePatients'
import { useServiceTypes } from '@/modules/visits/hooks/useServiceTypes'
import { useWorkers, useWorkerSlots } from '@/modules/workers/hooks/useWorkers'
import { useCompanies } from '@/modules/companies/hooks/useCompanies'
import { useCreateAppointment } from '../hooks/useAppointments'
import { toast } from 'sonner'
import type { Patient } from '@/types/patient'

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMondayStr(d: Date): string {
  const day = d.getDay() // 0=Sun…6=Sat
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

function addWeeks(dateStr: string, weeks: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + weeks * 7)
  return d.toISOString().slice(0, 10)
}

function formatDateCol(dateStr: string): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const d = new Date(dateStr + 'T00:00:00')
  return `${days[d.getDay()]} ${d.getDate()}`
}

function formatWeekRange(weekStart: string): string {
  const months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ]
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(weekStart + 'T00:00:00')
  end.setDate(end.getDate() + 6)
  const same = start.getMonth() === end.getMonth()
  if (same) {
    return `${start.getDate()}–${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`
  }
  return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`
}

function formatScheduledAt(scheduledAt: string): string {
  if (!scheduledAt) return '—'
  const d = new Date(scheduledAt + ':00')
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]} ${d.getFullYear()} a las ${hh}:${mm}`
}

// ─── Wizard state ────────────────────────────────────────────────────────────

type WizardData = {
  patientId: string
  patientName: string
  asTutor: boolean
  wardId: string
  wardName: string
  serviceTypeId: string
  serviceTypeName: string
  durationMinutes: number
  modality: 'particular' | 'company'
  companyId: string
  companyName: string
  workerId: string
  workerName: string
  weekStart: string
  scheduledAt: string // "YYYY-MM-DDTHH:MM"
  notes: string
}

const INITIAL: WizardData = {
  patientId: '',
  patientName: '',
  asTutor: false,
  wardId: '',
  wardName: '',
  serviceTypeId: '',
  serviceTypeName: '',
  durationMinutes: 60,
  modality: 'particular',
  companyId: '',
  companyName: '',
  workerId: '',
  workerName: '',
  weekStart: getMondayStr(new Date()),
  scheduledAt: '',
  notes: '',
}

const STEPS = [
  { num: 1, label: 'Paciente' },
  { num: 2, label: 'Servicio' },
  { num: 3, label: 'Horario' },
  { num: 4, label: 'Confirmar' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function AppointmentWizardPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(INITIAL)
  const [patientSearch, setPatientSearch] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const createMutation = useCreateAppointment()

  // Queries
  const { data: patientsData } = usePatients({ search: patientSearch || undefined, limit: 50 })
  const patients = patientsData?.data ?? []

  const { data: wards = [] } = usePatientWards(data.patientId)

  const { data: serviceTypes = [] } = useServiceTypes(true)

  const { data: workersData } = useWorkers({ active: true, limit: 200 })
  const workers = workersData?.data ?? []

  const { data: companiesData } = useCompanies({ limit: 200 })
  const companies = companiesData?.data ?? []

  const { data: slots = [], isFetching: loadingSlots } = useWorkerSlots(
    data.workerId,
    data.weekStart,
    data.durationMinutes || 60,
  )

  // Group slots by date for calendar display
  const slotsByDate = useMemo(() => {
    const map: Record<string, typeof slots> = {}
    for (const slot of slots) {
      if (!map[slot.date]) map[slot.date] = []
      map[slot.date].push(slot)
    }
    return map
  }, [slots])

  const orderedDates = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate])

  function patch(updates: Partial<WizardData>) {
    setData(prev => ({ ...prev, ...updates }))
  }

  function canProceed(): boolean {
    if (step === 1) return data.asTutor ? !!data.wardId : !!data.patientId
    if (step === 2) return !!data.serviceTypeId
    if (step === 3) return !!data.scheduledAt
    return true
  }

  async function handleSubmit() {
    const effectivePatientId =
      data.asTutor && data.wardId ? data.wardId : data.patientId
    try {
      await createMutation.mutateAsync({
        patient_id: effectivePatientId,
        service_type_id: data.serviceTypeId,
        worker_id: data.workerId || undefined,
        company_id:
          data.modality === 'company' && data.companyId ? data.companyId : undefined,
        scheduled_at: data.scheduledAt,
        duration_minutes: data.durationMinutes || undefined,
        notes: data.notes || undefined,
        session_count: 1,
      })
      toast.success('Cita agendada correctamente')
      navigate('/appointments')
    } catch {
      toast.error('Error al agendar la cita')
    }
  }

  // ─── Step renderers ──────────────────────────────────────────────────────

  function PatientRow({ p }: { p: Patient }) {
    const selected = data.patientId === p.id
    return (
      <button
        type="button"
        onClick={() =>
          patch({
            patientId: p.id,
            patientName: `${p.first_name} ${p.last_name}`,
            wardId: '',
            wardName: '',
            asTutor: false,
          })
        }
        className={cn(
          'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors',
          selected
            ? 'border-primary bg-primary/5 font-medium'
            : 'hover:bg-muted',
        )}
      >
        <div>
          <span className="font-medium">
            {p.first_name} {p.last_name}
          </span>
          {p.rut && (
            <span className="ml-2 text-xs text-muted-foreground">{p.rut}</span>
          )}
        </div>
        {selected && <Check className="h-4 w-4 shrink-0 text-primary" />}
      </button>
    )
  }

  function renderStep1() {
    return (
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Buscar paciente</Label>
          <Input
            placeholder="Nombre o RUT..."
            value={patientSearch}
            onChange={e => setPatientSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border p-2">
          {patients.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {patientSearch ? 'No se encontraron pacientes' : 'Escriba para buscar pacientes'}
            </p>
          ) : (
            patients.map(p => <PatientRow key={p.id} p={p} />)
          )}
        </div>

        {data.patientId && wards.length > 0 && (
          <div className="space-y-3 rounded-lg border p-4">
            <Label className="font-medium">¿Para quién es la cita?</Label>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={!data.asTutor}
                  onChange={() => patch({ asTutor: false, wardId: '', wardName: '' })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Para {data.patientName}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={data.asTutor}
                  onChange={() => patch({ asTutor: true })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Para uno de sus pupilos</span>
              </label>
            </div>

            {data.asTutor && (
              <div className="space-y-1 pt-1">
                {wards.map(w => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() =>
                      patch({ wardId: w.id, wardName: `${w.first_name} ${w.last_name}` })
                    }
                    className={cn(
                      'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
                      data.wardId === w.id
                        ? 'border-primary bg-primary/5 font-medium'
                        : 'hover:bg-muted',
                    )}
                  >
                    <span>
                      {w.first_name} {w.last_name}
                    </span>
                    {data.wardId === w.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  function renderStep2() {
    return (
      <div className="space-y-6">
        <div>
          <Label className="mb-3 block font-medium">Tipo de servicio</Label>
          {serviceTypes.filter(st => !st.is_group_service).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay tipos de servicio configurados.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {serviceTypes.filter(st => !st.is_group_service).map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() =>
                    patch({
                      serviceTypeId: st.id,
                      serviceTypeName: st.name,
                      durationMinutes: st.default_duration_minutes ?? 60,
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
                    <Badge variant="outline" className="mt-1 text-xs">
                      {st.category}
                    </Badge>
                  )}
                  {st.default_duration_minutes && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {st.default_duration_minutes} min
                    </p>
                  )}
                  {st.is_group_service && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      Grupal
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="font-medium">Modalidad</Label>
          <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={data.modality === 'particular'}
                  onChange={() => patch({ modality: 'particular', companyId: '', companyName: '' })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Particular</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  checked={data.modality === 'company'}
                  onChange={() => patch({ modality: 'company' })}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">Empresa</span>
              </label>
            </div>

          {data.modality === 'company' && (
            <div>
              <Label className="mb-1 block text-sm">Empresa</Label>
              <Select
                value={data.companyId || 'none'}
                onValueChange={v => {
                  const co = companies.find(c => c.id === v)
                  patch({
                    companyId: v === 'none' ? '' : v,
                    companyName: co?.name ?? '',
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empresa..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin empresa</SelectItem>
                  {companies.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    )
  }

  function renderStep3() {
    return (
      <div className="space-y-5">
        {/* Worker selector */}
        <div>
          <Label className="mb-1 block">Profesional</Label>
          <Select
            value={data.workerId || 'none'}
            onValueChange={v => {
              const w = workers.find(x => x.id === v)
              patch({
                workerId: v === 'none' ? '' : v,
                workerName: w ? `${w.first_name} ${w.last_name}` : '',
                scheduledAt: '',
              })
              setManualMode(false)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar profesional..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin profesional asignado</SelectItem>
              {workers.map(w => (
                <SelectItem key={w.id} value={w.id}>
                  {w.first_name} {w.last_name}
                  {w.role_title ? ` — ${w.role_title}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Calendar */}
        {data.workerId ? (
          <div className="space-y-3">
            {/* Week navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  patch({ weekStart: addWeeks(data.weekStart, -1), scheduledAt: '' })
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {formatWeekRange(data.weekStart)}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  patch({ weekStart: addWeeks(data.weekStart, 1), scheduledAt: '' })
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Slot grid */}
            {loadingSlots ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Cargando horarios...
              </div>
            ) : orderedDates.length === 0 ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-medium text-amber-800">Sin bloques de horario para esta semana</p>
                  <p className="mt-1 text-xs text-amber-700">
                    El profesional no tiene disponibilidad configurada para esta semana.
                    Navega a otra semana o ingresa la hora manualmente.
                  </p>
                </div>
                {!manualMode ? (
                  <Button variant="outline" size="sm" onClick={() => setManualMode(true)}>
                    Ingresar hora manualmente
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Label>Fecha y hora</Label>
                    <Input
                      type="datetime-local"
                      value={data.scheduledAt}
                      onChange={e => patch({ scheduledAt: e.target.value })}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {data.scheduledAt && (
                      <p className="text-xs text-muted-foreground">
                        {formatScheduledAt(data.scheduledAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="inline-flex min-w-full gap-2">
                  {orderedDates.map(date => (
                    <div key={date} className="flex min-w-[80px] flex-1 flex-col gap-1">
                      <div className="rounded-md bg-muted px-2 py-1 text-center text-xs font-medium">
                        {formatDateCol(date)}
                      </div>
                      {slotsByDate[date].map(slot => {
                        const slotKey = `${slot.date}T${slot.start_time}`
                        const isSelected = data.scheduledAt === slotKey
                        return (
                          <button
                            key={slotKey}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => patch({ scheduledAt: slotKey })}
                            className={cn(
                              'rounded border px-1.5 py-1.5 text-xs font-medium transition-colors',
                              !slot.available
                                ? 'cursor-not-allowed border-muted bg-muted/60 text-muted-foreground line-through'
                                : isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-green-200 bg-green-50 text-green-800 hover:bg-green-100',
                            )}
                          >
                            {slot.start_time}
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.scheduledAt && (
              <p className="text-sm text-muted-foreground">
                Seleccionado:{' '}
                <span className="font-medium text-foreground">
                  {formatScheduledAt(data.scheduledAt)}
                </span>
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Selecciona un profesional para ver su disponibilidad
          </div>
        )}
      </div>
    )
  }

  function renderStep4() {
    const effectivePatient =
      data.asTutor && data.wardId
        ? `${data.wardName} (representado por ${data.patientName})`
        : data.patientName

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumen de la cita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Paciente</span>
              <span className="text-right font-medium">{effectivePatient || '—'}</span>
            </div>
            <Separator />
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Servicio</span>
              <span className="font-medium">{data.serviceTypeName || '—'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Duración</span>
              <span className="font-medium">
                {data.durationMinutes ? `${data.durationMinutes} min` : '—'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Modalidad</span>
              <span className="font-medium">
                {data.modality === 'company'
                  ? `Empresa${data.companyName ? ` (${data.companyName})` : ''}`
                  : 'Particular'}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Profesional</span>
              <span className="font-medium">{data.workerName || 'Sin asignar'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="shrink-0 text-muted-foreground">Fecha y hora</span>
              <span className="text-right font-medium">
                {formatScheduledAt(data.scheduledAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div>
          <Label className="mb-1 block">Notas (opcional)</Label>
          <Textarea
            placeholder="Observaciones, indicaciones especiales..."
            rows={4}
            value={data.notes}
            onChange={e => patch({ notes: e.target.value })}
          />
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Agendando...' : 'Confirmar cita'}
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
        title="Nueva cita"
        description="Agenda una cita médica o de bienestar"
        actions={
          <Button variant="ghost" size="sm" onClick={() => navigate('/appointments')}>
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

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
            Siguiente <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
