import { toast } from 'sonner'
import { RefreshCcw } from 'lucide-react'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/ui/PageHeader'

export function ContentDashboardPage() {
  const { data } = useCmsSnapshot()
  const { resetAll } = useCmsAdmin()

  if (!data) {
    return null
  }

  async function handleReset() {
    await resetAll.mutateAsync()
    toast.success('CMS reiniciado a datos seed.')
  }

  const cards = [
    { label: 'Posts', value: data.posts.length },
    { label: 'Categorias', value: data.categories.length },
    { label: 'Servicios', value: data.services.length },
    { label: 'FAQ', value: data.faqs.length },
    { label: 'Testimonios', value: data.testimonials.length },
    { label: 'Leads', value: data.leads.length },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard CMS"
        description="Vista rapida del contenido publicado y estructura SEO"
        actions={
          <Button variant="outline" onClick={handleReset} disabled={resetAll.isPending}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Restaurar seed
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
        <p>
          Quick wins activos: menu publico nuevo, rutas por servicio, metadata por pagina, schemas JSON-LD,
          CTA/WhatsApp/formularios, sitemap y robots listos en public/.
        </p>
      </div>
    </div>
  )
}
