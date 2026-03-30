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
import { useContracts, useDeleteContract } from '../hooks/useContracts'
import type { ContractDTO } from '../api/contractsApi'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador', active: 'Activo', paused: 'Pausado', expired: 'Vencido', terminated: 'Terminado',
}
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline', active: 'default', paused: 'secondary', expired: 'destructive', terminated: 'destructive',
}
const TYPE_LABELS: Record<string, string> = {
  mensual: 'Mensual', anual: 'Anual', paquete: 'Paquete', puntual: 'Puntual',
}

export function ContractListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useContracts()
  const deleteMutation = useDeleteContract()

  const columns: ColumnDef<ContractDTO>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'contract_type', header: 'Tipo', cell: ({ getValue }) => {
      const v = getValue<string>()
      return v ? TYPE_LABELS[v] ?? v : '—'
    }},
    { accessorKey: 'start_date', header: 'Inicio', cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString('es-CL') },
    { accessorKey: 'end_date', header: 'Vencimiento', cell: ({ getValue }) => {
      const v = getValue<string>()
      return v ? new Date(v).toLocaleDateString('es-CL') : '—'
    }},
    { accessorKey: 'value_clp', header: 'Valor', cell: ({ getValue }) => {
      const v = getValue<number>()
      return v ? `$${v.toLocaleString('es-CL')}` : '—'
    }},
    { accessorKey: 'status', header: 'Estado', cell: ({ getValue }) => {
      const s = getValue<string>()
      return <Badge variant={STATUS_VARIANTS[s] ?? 'outline'}>{STATUS_LABELS[s] ?? s}</Badge>
    }},
    { id: 'actions', header: '', cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/contracts/${row.original.id}`)}>Ver detalle</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/contracts/${row.original.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </DropdownMenuItem>
          {hasPermission('contracts:delete') && (
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
      toast.success('Contrato eliminado')
    } catch {
      toast.error('No se pudo eliminar el contrato')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contratos"
        description="Contratos de servicios con empresas"
        actions={
          hasPermission('contracts:create') ? (
            <Button onClick={() => navigate('/contracts/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo contrato
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
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">Sin contratos registrados</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/contracts/${row.original.id}`)}>
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
            <AlertDialogTitle>¿Eliminar contrato?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará también los servicios asociados.</AlertDialogDescription>
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
