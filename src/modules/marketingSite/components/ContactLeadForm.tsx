import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Building2, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { contentApi } from '@/modules/content/api/contentApi'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { cn } from '@/shared/utils/cn'

type LeadType = 'person' | 'company'

export function ContactLeadForm() {
  const location = useLocation()
  const [leadType, setLeadType] = useState<LeadType>('person')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!fullName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      toast.error('Completa los campos obligatorios.')
      return
    }

    if (leadType === 'company' && !companyName.trim()) {
      toast.error('Ingresa el nombre de la empresa.')
      return
    }

    const formattedMessage =
      leadType === 'company'
        ? [
            `Empresa: ${companyName.trim()}`,
            teamSize.trim() ? `Colaboradores aprox.: ${teamSize.trim()}` : null,
            '',
            message.trim(),
          ]
            .filter(Boolean)
            .join('\n')
        : message.trim()

    setIsSubmitting(true)
    try {
      await contentApi.submitLead({
        formType: leadType,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companyName: leadType === 'company' ? companyName.trim() : undefined,
        message: formattedMessage,
        sourcePath: location.pathname,
      })

      toast.success('Solicitud enviada. Te responderemos pronto.')
      setFullName('')
      setEmail('')
      setPhone('')
      setCompanyName('')
      setTeamSize('')
      setMessage('')
      setLeadType('person')
    } catch {
      toast.error('No se pudo enviar el formulario. Intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Formulario unico</p>
      <h2 className="mt-2 text-3xl font-semibold text-slate-900">Cuentanos que necesitas</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        Elige si consultas como persona o empresa. Si eliges empresa, se despliegan los datos adicionales.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-1.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLeadType('person')}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
              leadType === 'person' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <User className="h-4 w-4" />
            Persona
          </button>
          <button
            type="button"
            onClick={() => setLeadType('company')}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
              leadType === 'company' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <Building2 className="h-4 w-4" />
            Empresa
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="contact-name">Nombre completo *</Label>
          <Input
            id="contact-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ej: Maria Gonzalez"
          />
        </div>

        <div>
          <Label htmlFor="contact-email">Correo *</Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nombre@correo.com"
          />
        </div>

        <div>
          <Label htmlFor="contact-phone">Telefono *</Label>
          <Input
            id="contact-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+56 9 1234 5678"
          />
        </div>

        {leadType === 'company' && (
          <>
            <div>
              <Label htmlFor="contact-company">Empresa *</Label>
              <Input
                id="contact-company"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Nombre de la empresa"
              />
            </div>
            <div>
              <Label htmlFor="contact-team">Cantidad de colaboradores (opcional)</Label>
              <Input
                id="contact-team"
                value={teamSize}
                onChange={(event) => setTeamSize(event.target.value)}
                placeholder="Ej: 45"
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <Label htmlFor="contact-message">Mensaje *</Label>
          <Textarea
            id="contact-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            placeholder={
              leadType === 'company'
                ? 'Cuantanos sedes, area o equipo y objetivo (ej: pausas activas, bienestar empresarial, jornada de masajes).'
                : 'Cuantanos tu caso, servicio de interes y horario aproximado para coordinar.'
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
