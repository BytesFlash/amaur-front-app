import { useState } from 'react'
import { Plus, Pencil, MoreHorizontal } from 'lucide-react'
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { Textarea } from '@/shared/components/ui/textarea'
import { useServiceTypes, useCreateServiceType, useUpdateServiceType } from '../hooks/useServiceTypes'
import { useSpecialties } from '@/shared/hooks/useSpecialties'
import type { ServiceTypeDTO, CreateServiceTypeInput } from '../api/serviceTypesApi'
import { toast } from 'sonner'

type FormState = {
  name: string
  category: string
  description: string
  default_duration_minutes: string
  is_group_service: boolean
  requires_clinical_record: boolean
  specialty_codes: string[]
}

const EMPTY_FORM: FormState = {
  name: '',
  category: '',
  description: '',
  default_duration_minutes: '',
  is_group_service: false,
  requires_clinical_record: false,
  specialty_codes: [],
}

export function ServiceTypeListPage() {
  const { data: serviceTypes = [], isLoading } = useServiceTypes(false)
  const { data: specialties = [] } = useSpecialties()
  const createMutation = useCreateServiceType()
  const updateMutation = useUpdateServiceType()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ServiceTypeDTO | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(st: ServiceTypeDTO) {
    setEditing(st)
    setForm({
      name: st.name,
      category: st.category ?? '',
      description: st.description ?? '',
      default_duration_minutes: st.default_duration_minutes ? String(st.default_duration_minutes) : '',
      is_group_service: st.is_group_service,
      requires_clinical_record: st.requires_clinical_record,
      specialty_codes: st.specialties?.map((s) => s.code) ?? [],
    })
    setShowForm(true)
  }

  function toggleSpecialty(code: string, checked: boolean) {
    setForm((f) => ({
      ...f,
      specialty_codes: checked
        ? [...f.specialty_codes, code]
        : f.specialty_codes.filter((c) => c !== code),
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    const payload: CreateServiceTypeInput = {
      name: form.name.trim(),
      category: form.category || undefined,
      description: form.description || undefined,
      default_duration_minutes: form.default_duration_minutes ? Number(form.default_duration_minutes) : undefined,
      is_group_service: form.is_group_service,
      requires_clinical_record: form.requires_clinical_record,
      specialty_codes: form.specialty_codes.length > 0 ? form.specialty_codes : undefined,
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: payload })
        toast.success('Tipo de servicio actualizado')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Tipo de servicio creado')
      }
      setShowForm(false)
    } catch {
      toast.error('Error al guardar')
    }
  }

  async function handleToggleActive(st: ServiceTypeDTO) {
    try {
      await updateMutation.mutateAsync({ id: st.id, input: { is_active: !st.is_active } as any })
      toast.success(st.is_active ? 'Desactivado' : 'Activado')
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const columns: ColumnDef<ServiceTypeDTO>[] = [
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'category', header: 'Categoría', cell: ({ getValue }) => getValue<string>() ?? '—' },
    {
      accessorKey: 'default_duration_minutes',
      header: 'Duración',
      cell: ({ getValue }) => {
        const v = getValue<number>()
        return v ? `${v} min` : '—'
      },
    },
    {
      accessorKey: 'is_group_service',
      header: 'Grupal',
      cell: ({ getValue }) => getValue<boolean>() ? <Badge variant="outline">Sí</Badge> : '—',
    },
    {
      id: 'specialties',
      header: 'Especialidades',
      cell: ({ row }) => {
        const specs = row.original.specialties
        if (!specs?.length) return <span className="text-muted-foreground text-sm">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {specs.map((s) => (
              <Badge key={s.code} variant="secondary" className="text-xs">{s.name}</Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ getValue }) =>
        getValue<boolean>()
          ? <Badge variant="default">Activo</Badge>
          : <Badge variant="secondary">Inactivo</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openEdit(row.original)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleActive(row.original)}>
              {row.original.is_active ? 'Desactivar' : 'Activar'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({ data: serviceTypes, columns, getCoreRowModel: getCoreRowModel() })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de servicio"
        description="Catálogo de servicios clínicos y de bienestar"
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo tipo
          </Button>
        }
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8">Cargando...</TableCell></TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">Sin tipos de servicio registrados</TableCell></TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar tipo de servicio' : 'Nuevo tipo de servicio'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Kinesiología" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Categoría</Label>
              <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Ej: Rehabilitación" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Descripción</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Duración por defecto (minutos)</Label>
              <Input
                type="number"
                min={1}
                value={form.default_duration_minutes}
                onChange={(e) => setForm((f) => ({ ...f, default_duration_minutes: e.target.value }))}
                placeholder="60"
              />
              <p className="text-xs text-muted-foreground">Se usará para bloquear el horario del profesional al agendar.</p>
            </div>

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label>Especialidades requeridas</Label>
                <div className="rounded-md border bg-background p-3 grid grid-cols-2 gap-2">
                  {specialties.map((sp) => (
                    <div key={sp.code} className="flex items-center gap-2">
                      <Checkbox
                        id={`sp-${sp.code}`}
                        checked={form.specialty_codes.includes(sp.code)}
                        onCheckedChange={(v) => toggleSpecialty(sp.code, !!v)}
                      />
                      <Label htmlFor={`sp-${sp.code}`} className="cursor-pointer font-normal">{sp.name}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Los profesionales con estas especialidades podrán ser asignados a este tipo de servicio.
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Checkbox
                id="group"
                checked={form.is_group_service}
                onCheckedChange={(v) => setForm((f) => ({ ...f, is_group_service: !!v }))}
              />
              <Label htmlFor="group">Servicio grupal</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox
                id="clinical"
                checked={form.requires_clinical_record}
                onCheckedChange={(v) => setForm((f) => ({ ...f, requires_clinical_record: !!v }))}
              />
              <Label htmlFor="clinical">Requiere ficha clínica</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}