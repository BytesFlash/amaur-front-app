import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal } from 'lucide-react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { usePermission } from '@/shared/hooks/usePermission'
import { usePrograms } from '../hooks/usePrograms'
import type { ProgramDTO } from '../api/programsApi'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  active: 'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

function formatLocalDate(dateValue?: string) {
  if (!dateValue) return '—'
  const [year, month, day] = dateValue.slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('es-CL')
}

export function ProgramListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading } = usePrograms(statusFilter ? { status: statusFilter } : undefined)

  const columns: ColumnDef<ProgramDTO>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    {
      accessorKey: 'start_date',
      header: 'Inicio',
      cell: ({ getValue }) => formatLocalDate(getValue<string>()),
    },
    {
      accessorKey: 'end_date',
      header: 'Fin',
      cell: ({ getValue }) => {
        const v = getValue<string>()
        return v ? formatLocalDate(v) : '—'
      },
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
            <DropdownMenuItem onClick={() => navigate(`/programs/${row.original.id}`)}>
              Ver detalle
            </DropdownMenuItem>
            {hasPermission('contracts:edit') && (
              <DropdownMenuItem onClick={() => navigate(`/programs/${row.original.id}/edit`)}>
                Editar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({ data: data?.data ?? [], columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Programas empresariales"
        description="Programas de atención recurrente para empresas"
        actions={
          hasPermission('contracts:create') ? (
            <Button onClick={() => navigate('/programs/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo programa
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-4">
        <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Borrador</SelectItem>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="completed">Completado</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
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
                <TableCell colSpan={columns.length} className="text-center py-8">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                  Sin programas registrados
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/programs/${row.original.id}`)}
                >
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
    </div>
  )
}
