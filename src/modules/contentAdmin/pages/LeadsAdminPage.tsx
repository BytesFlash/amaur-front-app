import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { Button } from '@/shared/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'

export function LeadsAdminPage() {
  const { data } = useCmsSnapshot()
  const { updateLeadStatus } = useCmsAdmin()

  if (!data) {
    return null
  }

  async function handleStatusChange(id: string, status: 'new' | 'contacted' | 'closed') {
    await updateLeadStatus.mutateAsync({ id, status })
    toast.success('Estado del lead actualizado.')
  }

  return (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="font-semibold">Leads y formularios ({data.leads.length})</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Captura centralizada desde formularios de personas y empresas.
      </p>

      <div className="mt-4 space-y-3">
        {data.leads.length === 0 && <p className="text-sm text-muted-foreground">Aun no hay leads registrados.</p>}

        {data.leads.map((lead) => (
          <article key={lead.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{lead.fullName}</p>
                <p className="text-xs text-muted-foreground">{lead.email} • {lead.phone}</p>
                <p className="text-xs text-muted-foreground">Tipo: {lead.formType} • Origen: {lead.sourcePath}</p>
              </div>
              <div className="min-w-40">
                <Select value={lead.status} onValueChange={(value: 'new' | 'contacted' | 'closed') => handleStatusChange(lead.id, value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nuevo</SelectItem>
                    <SelectItem value="contacted">Contactado</SelectItem>
                    <SelectItem value="closed">Cerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {lead.companyName && <p className="mt-2 text-xs text-muted-foreground">Empresa: {lead.companyName}</p>}
            <p className="mt-2 text-sm text-muted-foreground">{lead.message}</p>
            <Button asChild variant="ghost" size="sm" className="mt-2 px-0">
              <a href={`mailto:${lead.email}`}>Responder por correo</a>
            </Button>
          </article>
        ))}
      </div>
    </section>
  )
}
