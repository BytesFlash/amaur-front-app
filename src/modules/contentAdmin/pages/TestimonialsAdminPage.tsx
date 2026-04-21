import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCmsAdmin, useCmsSnapshot } from '@/modules/content/hooks/useCms'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

export function TestimonialsAdminPage() {
  const { data } = useCmsSnapshot()
  const { saveTestimonial, deleteTestimonial } = useCmsAdmin()
  const [author, setAuthor] = useState('')
  const [role, setRole] = useState('')
  const [quote, setQuote] = useState('')

  if (!data) {
    return null
  }

  async function handleCreate() {
    if (!author || !role || !quote) {
      toast.error('Completa autor, rol y testimonio.')
      return
    }

    await saveTestimonial.mutateAsync({ author, role, quote })
    toast.success('Testimonio guardado.')
    setAuthor('')
    setRole('')
    setQuote('')
  }

  async function handleDelete(id: string) {
    await deleteTestimonial.mutateAsync(id)
    toast.success('Testimonio eliminado.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Nuevo testimonio</h2>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Autor</Label>
            <Input value={author} onChange={(event) => setAuthor(event.target.value)} placeholder="Nombre o cargo" />
          </div>
          <div>
            <Label>Rol</Label>
            <Input value={role} onChange={(event) => setRole(event.target.value)} placeholder="Paciente / Empresa" />
          </div>
          <div>
            <Label>Testimonio</Label>
            <Textarea value={quote} onChange={(event) => setQuote(event.target.value)} rows={4} />
          </div>
          <Button onClick={handleCreate} disabled={saveTestimonial.isPending}>
            <Plus className="mr-2 h-4 w-4" /> Guardar testimonio
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="font-semibold">Testimonios actuales ({data.testimonials.length})</h2>
        <div className="mt-4 space-y-2">
          {data.testimonials.map((testimonial) => (
            <article key={testimonial.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{testimonial.author}</p>
              <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">"{testimonial.quote}"</p>
              <Button variant="ghost" size="sm" className="mt-2 text-destructive" onClick={() => handleDelete(testimonial.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Eliminar
              </Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
