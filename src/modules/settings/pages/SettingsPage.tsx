import { useState } from 'react'
import { Trash2, Plus, Tag } from 'lucide-react'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog'
import { useSpecialties, useCreateSpecialty, useDeleteSpecialty } from '@/shared/hooks/useSpecialties'
import { toast } from 'sonner'

function toCode(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function SettingsPage() {
  const { data: specialties = [], isLoading } = useSpecialties()
  const createMutation = useCreateSpecialty()
  const deleteMutation = useDeleteSpecialty()

  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const previewCode = toCode(name)

  async function handleCreate() {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }
    try {
      await createMutation.mutateAsync({ code: previewCode, name: name.trim() })
      toast.success('Especialidad creada')
      setName('')
      setShowAdd(false)
    } catch {
      toast.error('Error al crear especialidad. Verifica que el código no exista.')
    }
  }

  async function handleDelete(code: string) {
    try {
      await deleteMutation.mutateAsync(code)
      toast.success('Especialidad eliminada')
      setConfirmDelete(null)
    } catch {
      toast.error('No se puede eliminar: la especialidad está en uso por trabajadores o tipos de servicio.')
      setConfirmDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Preferencias del sistema y de cuenta"
      />

      {/* Specialty catalog management */}
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold text-sm">Especialidades</h2>
              <p className="text-xs text-muted-foreground">Catálogo de especialidades de profesionales y tipos de servicio</p>
            </div>
          </div>
          <Button size="sm" onClick={() => { setName(''); setShowAdd(true) }}>
            <Plus className="h-4 w-4 mr-1" /> Nueva especialidad
          </Button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : specialties.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No hay especialidades registradas</p>
          ) : (
            <div className="divide-y">
              {specialties.map((sp) => (
                <div key={sp.code} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{sp.name}</span>
                    <Badge variant="outline" className="text-xs font-mono">{sp.code}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setConfirmDelete(sp.code)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add specialty dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva especialidad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label>Nombre *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Terapia ocupacional"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            {name.trim() && (
              <p className="text-xs text-muted-foreground">
                Código generado: <span className="font-mono font-medium">{previewCode}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm delete dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Eliminar especialidad</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            ¿Seguro que deseas eliminar <span className="font-mono font-medium">{confirmDelete}</span>? Si está asignada a trabajadores o tipos de servicio, no podrá eliminarse.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
