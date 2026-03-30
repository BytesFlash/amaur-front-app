import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Input } from '@/shared/components/ui/input'
import { usePermission } from '@/shared/hooks/usePermission'
import { useAppointments, useDeleteAppointment } from '../hooks/useAppointments'
import type { AppointmentDTO } from '../api/appointmentsApi'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'Inasistencia',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  confirmed: 'outline',
  completed: 'default',
  cancelled: 'destructive',
  no_show: 'secondary',
}

export function AppointmentListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const params = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
    limit: 50,
  }

  const { data, isLoading } = useAppointments(params)
  const deleteMutation = useDeleteAppointment()

  const columns: ColumnDef<AppointmentDTO>[] = [
    {
      accessorKey: 'scheduled_at',
      header: 'Fecha / Hora',
      cell: ({ getValue }) => {
        const dt = new Date(getValue<string>())
        return (
          <span>
            {dt.toLocaleDateString('es-CL')} {dt.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      },
    },
    {
      accessorKey: 'patient_name',
      header: 'Paciente',
      cell: ({ getValue }) => getValue<string>() ?? '—',
    },
    {
      accessorKey: 'service_type_name',
      header: 'Servicio',
      cell: ({ getValue }) => getValue<string>() ?? '—',
    },
    {
      accessorKey: 'worker_name',
      header: 'Profesional',
      cell: ({ getValue }) => getValue<string>() ?? '—',
    },
    {
      accessorKey: 'duration_minutes',
      header: 'Duración',
      cell: ({ getValue }) => {
        const v = getValue<number>()
        return v ? `${v} min` : '—'
      },
    },
    {
      id: 'recurring',
      header: 'Recurrente',
      cell: ({ row }) => row.original.recurring_group_id ? <Badge variant="outline">Sí</Badge> : '—',
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ getValue }) => {
        const s = getValue<string>()
        return <Badge variant={STATUS_VARIANTS[s] ?? 'outline'}>{STATUS_LABELS[s] ?? s}</Badge>
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/appointments/${row.original.id}/edit`)}>
              Editar
            </DropdownMenuItem>
            {hasPermission('visits:delete') && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={(e) => { e.stopPropagation(); setDeleteId(row.original.id) }}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({ data: data?.data ?? [], columns, getCoreRowModel: getCoreRowModel() })

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Cita eliminada')
    } catch {
      toast.error('No se pudo eliminar la cita')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citas individuales"
        description="Agenda de citas por paciente"
        actions={
          hasPermission('visits:create') ? (
            <Button onClick={() => navigate('/appointments/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva cita
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
            <SelectItem value="no_show">Inasistencia</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Desde</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hasta</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36 h-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">Cargando...</TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  Sin citas registradas
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
