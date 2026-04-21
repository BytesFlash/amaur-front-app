import { useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

export function MediaAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveMediaAsset, deleteMediaAsset } = useCmsAdmin()

  const [fileName, setFileName] = useState('')
  const [url, setUrl] = useState('')
  const [altText, setAltText] = useState('')

  if (!data) {
    return null
  }

  async function handleCreate() {
    if (!fileName || !url || !altText) {
      toast.error('Completa nombre, URL y alt text.')
      return
    }

    await saveMediaAsset.mutateAsync({ fileName, url, altText })
    toast.success('Asset guardado.')
    setFileName('')
    setUrl('')
    setAltText('')
  }

  async function handleDelete(id: string) {
    await deleteMediaAsset.mutateAsync(id)
    toast.success('Asset eliminado.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Nuevo asset</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Mock de media library. Cuando exista backend, conecta upload real y almacenamiento.
        </p>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Nombre de archivo</Label>
            <Input value={fileName} onChange={(event) => setFileName(event.target.value)} />
          </div>
          <div>
            <Label>URL publica</Label>
            <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/assets/brand/imagen.png" />
          </div>
          <div>
            <Label>Alt text</Label>
            <Input value={altText} onChange={(event) => setAltText(event.target.value)} />
          </div>
          <Button onClick={handleCreate}>
            <ImagePlus className="mr-2 h-4 w-4" /> Guardar asset
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Media library ({data.mediaAssets.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.mediaAssets.map((asset) => (
            <article key={asset.id} className="rounded-lg border p-3">
              <img src={asset.url} alt={asset.altText} loading="lazy" className="h-24 w-full rounded-md object-cover" />
              <p className="mt-2 text-xs font-medium">{asset.fileName}</p>
              <p className="text-xs text-muted-foreground">{asset.altText}</p>
              <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => handleDelete(asset.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
