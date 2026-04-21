import { MessageCircle } from 'lucide-react'
import { buildWhatsappLink, siteConfig } from '@/modules/marketingSite/config/siteConfig'

interface WhatsAppFloatingButtonProps {
  message?: string
}

export function WhatsAppFloatingButton({ message }: WhatsAppFloatingButtonProps) {
  const href = buildWhatsappLink(message ?? siteConfig.defaultWhatsappMessagePerson)

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-emerald-500"
    >
      <MessageCircle className="h-4 w-4" />
      WhatsApp
    </a>
  )
}
