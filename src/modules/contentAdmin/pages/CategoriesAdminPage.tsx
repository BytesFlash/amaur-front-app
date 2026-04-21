import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { slugify } from '@/modules/content/lib/cmsUtils'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

export function CategoriesAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveCategory, deleteCategory } = useCmsAdmin()
  const [name, setName] = useState('')

  if (!data) {
    return null
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.error('Ingresa el nombre de la categoria.')
      return
    }

    await saveCategory.mutateAsync({
      name: name.trim(),
      slug: slugify(name),
      description: `Contenido sobre ${name.trim().toLowerCase()}.`,
    })

    toast.success('Categoria guardada.')
    setName('')
  }

  async function handleDelete(id: string) {
    await deleteCategory.mutateAsync(id)
    toast.success('Categoria eliminada.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Nueva categoria</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Nombre</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej: bienestar laboral" />
          </div>
          <p className="text-xs text-muted-foreground">Slug sugerido: {slugify(name || 'categoria')}</p>
          <Button onClick={handleCreate} disabled={saveCategory.isPending}>
            <Plus className="mr-2 h-4 w-4" /> Guardar categoria
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Categorias existentes ({data.categories.length})</h2>
        <div className="mt-4 space-y-2">
          {data.categories.map((category) => (
            <article key={category.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">/{category.slug}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
