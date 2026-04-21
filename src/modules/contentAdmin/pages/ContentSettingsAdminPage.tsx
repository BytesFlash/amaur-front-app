import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import type { SiteSettings, StaticPageContent } from '@/modules/content/types/cms'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Textarea } from '@/shared/components/ui/textarea'

export function ContentSettingsAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveSettings, savePage } = useCmsAdmin()
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null)
  const [pageDrafts, setPageDrafts] = useState<Record<string, StaticPageContent>>({})
  const [selectedPagePath, setSelectedPagePath] = useState('/')

  useEffect(() => {
    if (!data) {
      return
    }

    setSettingsDraft(data.settings)
    const map: Record<string, StaticPageContent> = {}
    data.pages.forEach((page) => {
      map[page.path] = page
    })
    setPageDrafts(map)
    setSelectedPagePath((current) => (map[current] ? current : data.pages[0]?.path ?? '/'))
  }, [data])

  const selectedPage = useMemo(() => pageDrafts[selectedPagePath], [pageDrafts, selectedPagePath])

  if (!data || !settingsDraft) {
    return null
  }

  function updateSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettingsDraft((current) => (current ? { ...current, [key]: value } : current))
  }

  function updateSelectedPage(patch: Partial<StaticPageContent>) {
    if (!selectedPage) {
      return
    }

    setPageDrafts((current) => ({
      ...current,
      [selectedPage.path]: {
        ...selectedPage,
        ...patch,
      },
    }))
  }

  async function handleSaveSettings() {
    if (!settingsDraft) {
      return
    }

    await saveSettings.mutateAsync(settingsDraft)
    toast.success('Configuracion general guardada.')
  }

  async function handleSavePage() {
    if (!selectedPage) {
      return
    }

    await savePage.mutateAsync(selectedPage)
    toast.success('Texto de pagina guardado.')
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Configuracion general</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Aqui puedes cambiar telefono, WhatsApp, correos, direccion y cobertura geografica sin tocar codigo.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Nombre comercial</Label>
            <Input value={settingsDraft.companyName} onChange={(event) => updateSetting('companyName', event.target.value)} />
          </div>
          <div>
            <Label>Razon social</Label>
            <Input value={settingsDraft.legalName} onChange={(event) => updateSetting('legalName', event.target.value)} />
          </div>
          <div>
            <Label>RUT</Label>
            <Input value={settingsDraft.taxId} onChange={(event) => updateSetting('taxId', event.target.value)} />
          </div>
          <div>
            <Label>WhatsApp (sin +)</Label>
            <Input value={settingsDraft.whatsappNumber} onChange={(event) => updateSetting('whatsappNumber', event.target.value)} />
          </div>
          <div>
            <Label>Telefono</Label>
            <Input value={settingsDraft.phone} onChange={(event) => updateSetting('phone', event.target.value)} />
          </div>
          <div>
            <Label>Instagram</Label>
            <Input value={settingsDraft.instagramUrl ?? ''} onChange={(event) => updateSetting('instagramUrl', event.target.value)} />
          </div>
          <div>
            <Label>LinkedIn</Label>
            <Input value={settingsDraft.linkedinUrl ?? ''} onChange={(event) => updateSetting('linkedinUrl', event.target.value)} />
          </div>
          <div>
            <Label>TikTok</Label>
            <Input value={settingsDraft.tiktokUrl ?? ''} onChange={(event) => updateSetting('tiktokUrl', event.target.value)} />
          </div>
          <div>
            <Label>Correo contacto</Label>
            <Input value={settingsDraft.contactEmail} onChange={(event) => updateSetting('contactEmail', event.target.value)} />
          </div>
          <div>
            <Label>Correo comercial</Label>
            <Input value={settingsDraft.salesEmail} onChange={(event) => updateSetting('salesEmail', event.target.value)} />
          </div>
          <div>
            <Label>Direccion</Label>
            <Input value={settingsDraft.address} onChange={(event) => updateSetting('address', event.target.value)} />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input value={settingsDraft.city} onChange={(event) => updateSetting('city', event.target.value)} />
          </div>
          <div>
            <Label>Region</Label>
            <Input value={settingsDraft.region} onChange={(event) => updateSetting('region', event.target.value)} />
          </div>
          <div>
            <Label>Pais</Label>
            <Input value={settingsDraft.country} onChange={(event) => updateSetting('country', event.target.value)} />
          </div>
          <div>
            <Label>Cobertura geografica</Label>
            <Input value={settingsDraft.geoCoverage} onChange={(event) => updateSetting('geoCoverage', event.target.value)} />
          </div>
          <div>
            <Label>URL de mapa</Label>
            <Input value={settingsDraft.mapUrl} onChange={(event) => updateSetting('mapUrl', event.target.value)} />
          </div>
          <div>
            <Label>Imagen OG default</Label>
            <Input value={settingsDraft.defaultOgImage} onChange={(event) => updateSetting('defaultOgImage', event.target.value)} />
          </div>
        </div>

        <Button className="mt-5" onClick={handleSaveSettings} disabled={saveSettings.isPending}>
          Guardar configuracion
        </Button>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Textos editables de Home y paginas</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Edita titulares institucionales y subtitulos comerciales sin despliegue de desarrollo.
        </p>

        <div className="mt-4 max-w-md">
          <Label>Pagina</Label>
          <Select value={selectedPagePath} onValueChange={setSelectedPagePath}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(pageDrafts).map((page) => (
                <SelectItem key={page.id} value={page.path}>
                  {page.path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPage && (
          <div className="mt-4 grid gap-4">
            <div>
              <Label>Hero title</Label>
              <Input value={selectedPage.heroTitle} onChange={(event) => updateSelectedPage({ heroTitle: event.target.value })} />
            </div>
            <div>
              <Label>Hero subtitle</Label>
              <Textarea
                value={selectedPage.heroSubtitle}
                rows={3}
                onChange={(event) => updateSelectedPage({ heroSubtitle: event.target.value })}
              />
            </div>
            <div>
              <Label>Meta title</Label>
              <Input
                value={selectedPage.seo.title}
                onChange={(event) => updateSelectedPage({ seo: { ...selectedPage.seo, title: event.target.value } })}
              />
            </div>
            <div>
              <Label>Meta description</Label>
              <Textarea
                value={selectedPage.seo.description}
                rows={2}
                onChange={(event) =>
                  updateSelectedPage({ seo: { ...selectedPage.seo, description: event.target.value } })
                }
              />
            </div>

            <Button onClick={handleSavePage} disabled={savePage.isPending}>
              Guardar textos de pagina
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
