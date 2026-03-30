import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { usePermission } from '@/shared/hooks/usePermission'
import { useVisits, useDeleteVisit } from '../hooks/useVisits'
import type { VisitDTO } from '../api/visitsApi'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programada', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada', no_show: 'Inasistencia',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  scheduled: 'secondary', in_progress: 'default', completed: 'default', cancelled: 'destructive', no_show: 'outline',
}

export function VisitListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useVisits()
  const deleteMutation = useDeleteVisit()

  const columns: ColumnDef<VisitDTO>[] = [
    { accessorKey: 'scheduled_date', header: 'Fecha', cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString('es-CL') },
    { accessorKey: 'scheduled_start', header: 'Hora inicio', cell: ({ getValue }) => getValue<string>() ?? '—' },
    { accessorKey: 'status', header: 'Estado', cell: ({ getValue }) => {
      const s = getValue<string>()
      return <Badge variant={STATUS_VARIANTS[s] ?? 'outline'}>{STATUS_LABELS[s] ?? s}</Badge>
    }},
    { accessorKey: 'company_id', header: 'Empresa', cell: ({ getValue }) => <span className="text-xs font-mono">{(getValue<string>()).slice(0, 8)}…</span> },
    { accessorKey: 'general_notes', header: 'Notas', cell: ({ getValue }) => getValue<string>() ?? '—' },
    { id: 'actions', header: '', cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/agendas/${row.original.id}`)}>Ver detalle</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/agendas/${row.original.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </DropdownMenuItem>
          {hasPermission('visits:delete') && (
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
              <Trash2 className="h-4 w-4 mr-2" />Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ]

  const table = useReactTable({ data: data?.data ?? [], columns, getCoreRowModel: getCoreRowModel() })

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteMutation.mutateAsync(deleteId)
      toast.success('Agenda eliminada')
    } catch {
      toast.error('No se pudo eliminar la agenda')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda"
        description="Registro de agendas y sesiones"
        actions={
          hasPermission('visits:create') ? (
            <Button onClick={() => navigate('/agendas/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva agenda
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(h => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">Sin agendas registradas</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/agendas/${row.original.id}`)}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar agenda?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
