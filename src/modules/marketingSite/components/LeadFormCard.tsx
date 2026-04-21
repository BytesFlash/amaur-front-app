import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { contentApi } from '@/modules/content/api/contentApi'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'

interface LeadFormCardProps {
  formType: 'person' | 'company'
  title: string
  description: string
}

export function LeadFormCard({ formType, title, description }: LeadFormCardProps) {
  const location = useLocation()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!fullName || !email || !phone || !message) {
      toast.error('Completa los campos obligatorios.')
      return
    }

    setIsSubmitting(true)
    try {
      await contentApi.submitLead({
        formType,
        fullName,
        email,
        phone,
        companyName: formType === 'company' ? companyName : undefined,
        message,
        sourcePath: location.pathname,
      })

      toast.success('Solicitud enviada. Te responderemos pronto.')
      setFullName('')
      setEmail('')
      setPhone('')
      setCompanyName('')
      setMessage('')
    } catch {
      toast.error('No se pudo enviar el formulario. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <div className="mt-6 space-y-4">
        <div>
          <Label htmlFor={`${formType}-name`}>Nombre completo *</Label>
          <Input id={`${formType}-name`} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ej: Maria Gonzalez" />
        </div>

        <div>
          <Label htmlFor={`${formType}-email`}>Correo *</Label>
          <Input id={`${formType}-email`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@correo.com" />
        </div>

        <div>
          <Label htmlFor={`${formType}-phone`}>Telefono *</Label>
          <Input id={`${formType}-phone`} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+56 9 1234 5678" />
        </div>

        {formType === 'company' && (
          <div>
            <Label htmlFor={`${formType}-company`}>Empresa</Label>
            <Input id={`${formType}-company`} value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Nombre de la empresa" />
          </div>
        )}

        <div>
          <Label htmlFor={`${formType}-message`}>Mensaje *</Label>
          <Textarea
            id={`${formType}-message`}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            placeholder={
              formType === 'company'
                ? 'Cuantanos cantidad de colaboradores, sedes y objetivo del programa.'
                : 'Cuantanos que necesitas y en que horario te conviene.'
            }
          />
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full rounded-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar solicitud'
        )}
      </Button>
    </form>
  )
}
