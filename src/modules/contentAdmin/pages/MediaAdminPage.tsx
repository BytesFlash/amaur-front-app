import { useCallback, useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { contentAdminApi } from '@/modules/content/api/contentAdminApi'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/utils/cn'

export function MediaAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveMediaAsset, deleteMediaAsset } = useCmsAdmin()

  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [altText, setAltText] = useState('')
  const [uploading, setUploading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  function acceptFile(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes.')
      return
    }
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) acceptFile(file)
  }

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) acceptFile(file)
  }, [])

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function resetForm() {
    setSelectedFile(null)
    setPreview(null)
    setAltText('')
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error('Selecciona una imagen primero.')
      return
    }
    if (!altText.trim()) {
      toast.error('El alt text es obligatorio.')
      return
    }

    setUploading(true)
    try {
      const result = await contentAdminApi.uploadMediaFile(selectedFile)
      await saveMediaAsset.mutateAsync({
        fileName: result.fileName,
        url: result.url,
        altText: altText.trim(),
        kind: 'image',
      })
      toast.success('Imagen subida y registrada.')
      resetForm()
    } catch {
      toast.error('Error al subir la imagen. Verifica que la API esté corriendo.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteMediaAsset.mutateAsync(id)
    toast.success('Asset eliminado.')
  }

  if (!data) return null

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      {/* ── Upload panel ─────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Subir imagen</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Arrastra un archivo o haz clic para seleccionar. Máximo 10 MB. Formatos: JPEG, PNG, WebP, GIF, AVIF.
        </p>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'mt-4 flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors',
            dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-slate-400',
          )}
        >
          {preview ? (
            <img src={preview} alt="Vista previa" className="h-28 w-full rounded-lg object-contain" />
          ) : (
            <>
              <UploadCloud className="h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm text-slate-500">Arrastra aquí o haz clic</p>
            </>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />

        {selectedFile && (
          <p className="mt-2 truncate text-xs text-muted-foreground">{selectedFile.name} — {(selectedFile.size / 1024).toFixed(0)} KB</p>
        )}

        <div className="mt-4 space-y-3">
          <div>
            <Label>Alt text <span className="text-destructive">*</span></Label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descripción accesible de la imagen"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="flex-1">
              {uploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subiendo...</>
              ) : (
                <><ImagePlus className="mr-2 h-4 w-4" /> Subir imagen</>
              )}
            </Button>
            {selectedFile && (
              <Button variant="ghost" onClick={resetForm} disabled={uploading}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ── Library panel ────────────────────────────────────── */}
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Media library ({data.mediaAssets.length})</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {data.mediaAssets.map((asset) => (
            <article key={asset.id} className="rounded-lg border p-3">
              <img src={asset.url} alt={asset.altText} loading="lazy" className="h-24 w-full rounded-md object-cover" />
              <p className="mt-2 truncate text-xs font-medium">{asset.fileName}</p>
              <p className="truncate text-xs text-muted-foreground">{asset.altText}</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-destructive hover:text-destructive"
                onClick={() => handleDelete(asset.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </article>
          ))}
          {data.mediaAssets.length === 0 && (
            <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
              No hay assets aún. Sube tu primera imagen.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
