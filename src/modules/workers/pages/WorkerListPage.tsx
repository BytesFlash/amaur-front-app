import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table'
import { usePermission } from '@/shared/hooks/usePermission'
import { useSpecialties } from '@/shared/hooks/useSpecialties'
import { useWorkers, useDeleteWorker } from '../hooks/useWorkers'
import type { WorkerDTO } from '../api/workersApi'
import { toast } from 'sonner'

export function WorkerListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [search, setSearch] = useState('')
  const [specialtyCode, setSpecialtyCode] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { data: catalog = [] } = useSpecialties()
  const { data, isLoading } = useWorkers({
    search: search || undefined,
    specialty_code: specialtyCode || undefined,
    active: showAll ? false : true,
  })
  const deleteMutation = useDeleteWorker()

  const columns: ColumnDef<WorkerDTO>[] = [
    { accessorKey: 'first_name', header: 'Nombre', cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}` },
    { accessorKey: 'rut', header: 'RUT', cell: ({ getValue }) => getValue<string>() || '—' },
    { accessorKey: 'role_title', header: 'Cargo', cell: ({ getValue }) => getValue<string>() || '—' },
    {
      id: 'specialties',
      header: 'Especialidades',
      cell: ({ row }) => {
        const items = row.original.specialties
        if (!items || items.length === 0) return <span className="text-muted-foreground">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {items.map((s) => (
              <Badge key={s.code} variant="secondary" className="text-xs">{s.name}</Badge>
            ))}
          </div>
        )
      },
    },
    { accessorKey: 'email', header: 'Email', cell: ({ getValue }) => getValue<string>() || '—' },
    {
      accessorKey: 'is_active', header: 'Estado',
      cell: ({ getValue }) => getValue<boolean>()
        ? <Badge variant="default">Activo</Badge>
        : <Badge variant="secondary">Inactivo</Badge>,
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/workers/${row.original.id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />Editar
            </DropdownMenuItem>
            {hasPermission('workers:delete') && (
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
                <Trash2 className="h-4 w-4 mr-2" />Eliminar
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
      toast.success('Profesional eliminado')
    } catch {
      toast.error('No se pudo eliminar el profesional')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profesionales"
        description="Equipo de bienestar ocupacional AMAUR"
        actions={
          hasPermission('workers:create') ? (
            <Button onClick={() => navigate('/workers/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo profesional
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Buscar por nombre, RUT o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={specialtyCode || 'all'}
          onValueChange={(v) => setSpecialtyCode(v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Filtrar por especialidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las especialidades</SelectItem>
            {catalog.map((sp) => (
              <SelectItem key={sp.code} value={sp.code}>{sp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showAll}
            onChange={e => setShowAll(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          Mostrar inactivos
        </label>
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
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">Sin profesionales registrados</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-muted/50">
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
            <AlertDialogTitle>¿Eliminar profesional?</AlertDialogTitle>
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
