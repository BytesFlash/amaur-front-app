import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Badge } from '@/shared/components/ui/badge'
import { useWorkers, useWorkerCalendar } from '../hooks/useWorkers'
import { cn } from '@/shared/utils/cn'
import type { DayCalendarDTO } from '../api/workersApi'

// ─── Helpers ────────────────────────────────────────────────────────────────

function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function prevMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function nextMonth(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const names = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return `${names[m - 1]} ${y}`
}

function minutesToHours(min: number): string {
  if (min <= 0) return '0 h'
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ─── Day cell ────────────────────────────────────────────────────────────────

function DayCell({
  day,
  today,
  selected,
  onSelect,
}: {
  day: DayCalendarDTO
  today: string
  selected: boolean
  onSelect: () => void
}) {
  const isToday = day.date === today
  const dayNum = parseInt(day.date.split('-')[2])

  // Determine color based on occupancy
  let bg = 'bg-background hover:bg-muted/50'
  let border = 'border-border'
  let labelColor = 'text-muted-foreground'

  if (day.total_minutes > 0) {
    const ratio = day.available_minutes / day.total_minutes
    if (ratio >= 0.5) {
      bg = 'bg-green-50 hover:bg-green-100'
      border = 'border-green-200'
      labelColor = 'text-green-700'
    } else if (ratio > 0) {
      bg = 'bg-amber-50 hover:bg-amber-100'
      border = 'border-amber-200'
      labelColor = 'text-amber-700'
    } else {
      bg = 'bg-red-50 hover:bg-red-100'
      border = 'border-red-200'
      labelColor = 'text-red-700'
    }
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'min-h-[88px] w-full rounded-md border p-2 text-left transition-colors',
        bg,
        border,
        selected ? 'ring-2 ring-primary ring-offset-1' : '',
        isToday ? 'ring-2 ring-primary ring-offset-1' : '',
      )}
    >
      <span
        className={cn(
          'block text-xs font-semibold',
          isToday ? 'text-primary' : 'text-foreground',
        )}
      >
        {dayNum}
      </span>

      {day.total_minutes > 0 && (
        <>
          {/* Occupancy bar */}
          <div className="mt-1.5 h-1 rounded-full bg-white/60">
            <div
              className={cn('h-1 rounded-full', labelColor === 'text-green-700' ? 'bg-green-500' : labelColor === 'text-amber-700' ? 'bg-amber-500' : 'bg-red-500')}
              style={{
                width: `${Math.min(100, (day.booked_minutes / day.total_minutes) * 100)}%`,
              }}
            />
          </div>
          <p className={cn('mt-1 text-[10px] leading-tight', labelColor)}>
            {minutesToHours(day.available_minutes)} libre
          </p>
          {(day.appointments ?? []).length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {(day.appointments ?? []).length} cita{(day.appointments ?? []).length !== 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </button>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export function WorkerCalendarPage() {
  const [workerId, setWorkerId] = useState('')
  const [month, setMonth] = useState(currentMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data: workersData } = useWorkers({ active: true, limit: 200 })
  const workers = workersData?.data ?? []

  const { data: calendarDays = [], isLoading } = useWorkerCalendar(workerId, month)

  const today = new Date().toISOString().slice(0, 10)

  // Build 7-column grid with leading padding for the month's first weekday
  const firstDayOfWeek =
    calendarDays.length > 0
      ? new Date(calendarDays[0].date + 'T00:00:00').getDay()
      : 0

  const cells: (DayCalendarDTO | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...calendarDays,
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedDay = calendarDays.find((d) => d.date === selectedDate) ?? null

  // Monthly totals
  const totalAvail = calendarDays.reduce((s, d) => s + d.available_minutes, 0)
  const totalBooked = calendarDays.reduce((s, d) => s + d.booked_minutes, 0)
  const totalCapacity = calendarDays.reduce((s, d) => s + d.total_minutes, 0)

  const selectedWorker = workers.find((w) => w.id === workerId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario de profesionales"
        description="Vista mensual de disponibilidad y citas por profesional"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={workerId || 'none'}
          onValueChange={(v) => {
            setWorkerId(v === 'none' ? '' : v)
            setSelectedDate(null)
          }}
        >
          <SelectTrigger className="w-60">
            <SelectValue placeholder="Seleccionar profesional..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">— Seleccionar profesional —</SelectItem>
            {workers.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.first_name} {w.last_name}
                {w.role_title ? ` (${w.role_title})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => { setMonth(prevMonth(month)); setSelectedDate(null) }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-44 text-center text-sm font-medium">{monthLabel(month)}</span>
          <Button variant="outline" size="icon" onClick={() => { setMonth(nextMonth(month)); setSelectedDate(null) }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-4">
          {[
            { color: 'bg-green-400', label: '≥50% libre' },
            { color: 'bg-amber-400', label: '25-50% libre' },
            { color: 'bg-red-400', label: '<25% libre' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={cn('h-2.5 w-2.5 rounded-sm', l.color)} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {!workerId ? (
        <div className="rounded-lg border border-dashed p-20 text-center text-sm text-muted-foreground">
          Selecciona un profesional para ver su calendario de disponibilidad
        </div>
      ) : isLoading ? (
        <div className="rounded-lg border p-20 text-center text-sm text-muted-foreground">
          Cargando calendario...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {/* Calendar */}
          <div className="space-y-3">
            {/* Monthly summary */}
            {totalCapacity > 0 && (
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-card p-3 text-center">
                  <p className="text-xs text-muted-foreground">Capacidad mensual</p>
                  <p className="text-lg font-semibold">{minutesToHours(totalCapacity)}</p>
                </div>
                <div className="rounded-lg border bg-green-50 border-green-200 p-3 text-center">
                  <p className="text-xs text-green-700">Disponible</p>
                  <p className="text-lg font-semibold text-green-800">{minutesToHours(totalAvail)}</p>
                </div>
                <div className="rounded-lg border bg-red-50 border-red-200 p-3 text-center">
                  <p className="text-xs text-red-700">Ocupado</p>
                  <p className="text-lg font-semibold text-red-800">{minutesToHours(totalBooked)}</p>
                </div>
              </div>
            )}

            <div className="rounded-lg border bg-card p-4">
              {/* Day-of-week headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="py-1 text-center text-xs font-medium text-muted-foreground">
                    {d}
                  </div>
                ))}
              </div>
              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell, i) =>
                  cell === null ? (
                    <div key={`pad-${i}`} className="min-h-[88px]" />
                  ) : (
                    <DayCell
                      key={cell.date}
                      day={cell}
                      today={today}
                      selected={cell.date === selectedDate}
                      onSelect={() =>
                        setSelectedDate((prev) => (prev === cell.date ? null : cell.date))
                      }
                    />
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Day detail panel */}
          <div className="rounded-lg border bg-card p-4 self-start">
            {!selectedDay ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <p>Haz clic en un día</p>
                <p>para ver el detalle</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm capitalize">
                    {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('es-CL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </h3>
                  {selectedWorker && (
                    <p className="text-xs text-muted-foreground">
                      {selectedWorker.first_name} {selectedWorker.last_name}
                    </p>
                  )}
                </div>

                {selectedDay.total_minutes > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-md bg-muted/50 p-2 text-center">
                        <p className="text-xs text-muted-foreground">Capacidad</p>
                        <p className="font-semibold">{minutesToHours(selectedDay.total_minutes)}</p>
                      </div>
                      <div className="rounded-md bg-green-50 p-2 text-center">
                        <p className="text-xs text-green-700">Disponible</p>
                        <p className="font-semibold text-green-800">{minutesToHours(selectedDay.available_minutes)}</p>
                      </div>
                    </div>

                    {/* Occupancy bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Ocupación</span>
                        <span>
                          {Math.round((selectedDay.booked_minutes / selectedDay.total_minutes) * 100)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, (selectedDay.booked_minutes / selectedDay.total_minutes) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                    Sin disponibilidad configurada para este día
                  </div>
                )}

                {/* Appointment list */}
                {(selectedDay.appointments ?? []).length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Bloques ({(selectedDay.appointments ?? []).length})
                    </p>
                    {(selectedDay.appointments ?? [])
                      .slice()
                      .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))
                      .map((appt, i) => (
                        <div
                          key={i}
                          className="rounded-md border bg-muted/30 px-2 py-2 text-xs space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
                            <span className="font-medium">{appt.scheduled_at}</span>
                            <Badge
                              variant={appt.type === 'group' ? 'secondary' : 'outline'}
                              className="ml-auto text-[10px]"
                            >
                              {appt.type === 'group' ? 'Grupal' : 'Individual'}
                            </Badge>
                          </div>
                          {appt.label && (
                            <p className="text-muted-foreground pl-5 truncate">{appt.label}</p>
                          )}
                          <p className="text-muted-foreground pl-5">{appt.duration_minutes} min</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  selectedDay.total_minutes > 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Sin citas para este día
                    </p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
