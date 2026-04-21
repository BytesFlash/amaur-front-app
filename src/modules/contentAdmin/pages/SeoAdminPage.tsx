import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import type { SeoEntry } from '@/modules/content/types/cms'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

export function SeoAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveSeoEntry } = useCmsAdmin()
  const [selectedId, setSelectedId] = useState<string>('')

  if (!data) {
    return null
  }

  const selected = useMemo(
    () => data.seoEntries.find((entry) => entry.id === selectedId) ?? data.seoEntries[0],
    [data.seoEntries, selectedId],
  )

  const [path, setPath] = useState(selected?.path ?? '/')
  const [title, setTitle] = useState(selected?.seo.title ?? '')
  const [description, setDescription] = useState(selected?.seo.description ?? '')

  async function handleSave(entry?: SeoEntry) {
    await saveSeoEntry.mutateAsync({
      id: entry?.id,
      path,
      seo: {
        title,
        description,
        canonicalPath: path,
      },
    })

    toast.success('SEO guardado.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Entradas SEO</h2>
        <div className="mt-4 space-y-2">
          {data.seoEntries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setSelectedId(entry.id)
                setPath(entry.path)
                setTitle(entry.seo.title)
                setDescription(entry.seo.description)
              }}
              className="w-full rounded-lg border p-3 text-left"
            >
              <p className="text-sm font-medium">{entry.path}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{entry.seo.title}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Editor SEO</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Edita metadata por pagina: title, description y canonical.
        </p>

        <div className="mt-4 space-y-3">
          <div>
            <Label>Path</Label>
            <Input value={path} onChange={(event) => setPath(event.target.value)} placeholder="/servicios/kinesiologia" />
          </div>
          <div>
            <Label>Meta title</Label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div>
            <Label>Meta description</Label>
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <Button onClick={() => handleSave(selected)}>Guardar cambios</Button>
          <Button variant="outline" onClick={() => handleSave(undefined)}>
            Crear nueva entrada
          </Button>
        </div>
      </section>
    </div>
  )
}
