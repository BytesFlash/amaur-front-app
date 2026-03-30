import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/shared/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { usePermission } from '@/shared/hooks/usePermission'
import { useCompanies, useDeleteCompany } from '../hooks/useCompanies'
import type { Company } from '@/types/company'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = { active: 'Activa', inactive: 'Inactiva', prospect: 'Prospecto', churned: 'Baja' }
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default', prospect: 'secondary', inactive: 'outline', churned: 'destructive',
}

export function CompanyListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data, isLoading } = useCompanies({ search: search || undefined })
  const deleteMutation = useDeleteCompany()

  const columns: ColumnDef<Company>[] = [
    { accessorKey: 'name', header: 'Nombre', cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        {row.original.fantasy_name && <div className="text-xs text-muted-foreground">{row.original.fantasy_name}</div>}
      </div>
    )},
    { accessorKey: 'rut', header: 'RUT', cell: ({ getValue }) => getValue<string>() || '—' },
    { accessorKey: 'industry', header: 'Industria', cell: ({ getValue }) => getValue<string>() || '—' },
    { accessorKey: 'city', header: 'Ciudad', cell: ({ getValue }) => getValue<string>() || '—' },
    { accessorKey: 'contact_name', header: 'Contacto', cell: ({ getValue }) => getValue<string>() || '—' },
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
          <DropdownMenuItem onClick={() => navigate(`/companies/${row.original.id}`)}>Ver detalle</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(`/companies/${row.original.id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </DropdownMenuItem>
          {hasPermission('companies:delete') && (
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
      toast.success('Empresa eliminada')
    } catch {
      toast.error('No se pudo eliminar la empresa')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas"
        description="Gestión de empresas clientes"
        actions={
          hasPermission('companies:create') ? (
            <Button onClick={() => navigate('/companies/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva empresa
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nombre, RUT o ciudad..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

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
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">Sin empresas registradas</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/companies/${row.original.id}`)}>
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
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
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
