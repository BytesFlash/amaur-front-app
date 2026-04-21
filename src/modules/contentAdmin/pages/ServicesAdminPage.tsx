import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import type { ServiceContent } from '@/modules/content/types/cms'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

export function ServicesAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveService } = useCmsAdmin()
  const [selectedSlug, setSelectedSlug] = useState<string>('')

  const selectedService = useMemo(
    () => data?.services.find((service) => service.slug === selectedSlug) ?? data?.services[0],
    [data?.services, selectedSlug],
  )

  const [draft, setDraft] = useState<ServiceContent | null>(null)

  if (!data || !selectedService) {
    return null
  }

  const current = draft && draft.id === selectedService.id ? draft : selectedService

  function updateDraft(patch: Partial<ServiceContent>) {
    const next = { ...current, ...patch }
    setDraft(next)
  }

  async function handleSave() {
    await saveService.mutateAsync({ ...current, updatedAt: new Date().toISOString() })
    toast.success('Servicio actualizado.')
    setDraft(null)
  }

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold">Servicios</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Edita textos comerciales, CTA y metadata SEO de cada landing individual.
      </p>

      <div className="mt-4 max-w-sm">
        <Label>Servicio</Label>
        <Select value={current.slug} onValueChange={setSelectedSlug}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.services.map((service) => (
              <SelectItem key={service.id} value={service.slug}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <Label>Nombre</Label>
          <Input value={current.name} onChange={(event) => updateDraft({ name: event.target.value })} />
        </div>
        <div>
          <Label>Slug</Label>
          <Input value={current.slug} onChange={(event) => updateDraft({ slug: event.target.value })} />
        </div>
        <div className="lg:col-span-2">
          <Label>Descripcion corta</Label>
          <Textarea value={current.shortDescription} onChange={(event) => updateDraft({ shortDescription: event.target.value })} rows={2} />
        </div>
        <div className="lg:col-span-2">
          <Label>Introduccion</Label>
          <Textarea value={current.intro} onChange={(event) => updateDraft({ intro: event.target.value })} rows={4} />
        </div>
        <div>
          <Label>CTA titulo</Label>
          <Input value={current.ctaTitle} onChange={(event) => updateDraft({ ctaTitle: event.target.value })} />
        </div>
        <div>
          <Label>CTA descripcion</Label>
          <Input value={current.ctaDescription} onChange={(event) => updateDraft({ ctaDescription: event.target.value })} />
        </div>
        <div>
          <Label>Meta title</Label>
          <Input
            value={current.seo.title}
            onChange={(event) => updateDraft({ seo: { ...current.seo, title: event.target.value } })}
          />
        </div>
        <div>
          <Label>Meta description</Label>
          <Input
            value={current.seo.description}
            onChange={(event) => updateDraft({ seo: { ...current.seo, description: event.target.value } })}
          />
        </div>
      </div>

      <Button className="mt-6" onClick={handleSave} disabled={saveService.isPending}>
        Guardar servicio
      </Button>
    </section>
  )
}
