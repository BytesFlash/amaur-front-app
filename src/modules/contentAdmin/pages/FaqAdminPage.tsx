import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

export function FaqAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveFaq, deleteFaq } = useCmsAdmin()
  const [pagePath, setPagePath] = useState('/servicios')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  if (!data) {
    return null
  }

  async function handleCreate() {
    if (!question || !answer) {
      toast.error('Pregunta y respuesta son obligatorias.')
      return
    }

    await saveFaq.mutateAsync({ pagePath, question, answer })
    toast.success('FAQ guardada.')
    setQuestion('')
    setAnswer('')
  }

  async function handleDelete(id: string) {
    await deleteFaq.mutateAsync(id)
    toast.success('FAQ eliminada.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Nueva FAQ</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Pagina asociada</Label>
            <Input value={pagePath} onChange={(event) => setPagePath(event.target.value)} placeholder="/servicios/kinesiologia" />
          </div>
          <div>
            <Label>Pregunta</Label>
            <Input value={question} onChange={(event) => setQuestion(event.target.value)} />
          </div>
          <div>
            <Label>Respuesta</Label>
            <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={4} />
          </div>
          <Button onClick={handleCreate} disabled={saveFaq.isPending}>
            <Plus className="mr-2 h-4 w-4" /> Guardar FAQ
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">FAQs existentes ({data.faqs.length})</h2>
        <div className="mt-4 space-y-2">
          {data.faqs.map((faq) => (
            <article key={faq.id} className="rounded-lg border p-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{faq.pagePath}</p>
              <p className="mt-1 text-sm font-medium">{faq.question}</p>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(faq.id)} className="mt-2 text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
