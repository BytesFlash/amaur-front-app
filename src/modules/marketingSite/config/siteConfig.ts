// Update these values before production launch.
// TODO: replace phone, WhatsApp, emails, social URLs, address, map URL and geographic coverage.
export const siteConfig = {
  siteName: 'AMAUR',
  siteUrl: 'https://www.amaur.cl',
  defaultOgImage: '/assets/brand/amaur-logo-dark.png',
  whatsappNumber: '56937544837', // TODO: replace with real WhatsApp number.
  defaultWhatsappMessagePerson: 'Hola AMAUR, quiero agendar una atencion.',
  defaultWhatsappMessageCompany: 'Hola AMAUR, quiero cotizar bienestar laboral para mi empresa.',
  phone: '+56 9 3754 4837', // TODO: replace with real phone.
  contactEmail: 'contacto@amaur.cl', // TODO: replace with real contact email.
  salesEmail: 'empresas@amaur.cl', // TODO: replace with real sales email.
  instagramUrl: 'https://www.instagram.com/amaurchile/', // TODO: replace with real Instagram URL.
  linkedinUrl: 'https://www.linkedin.com/company/amaur-chile/', // TODO: replace with real LinkedIn URL.
  tiktokUrl: 'https://www.tiktok.com/@amaurchile', // TODO: replace with real TikTok URL.
  address: 'Santiago, Chile', // TODO: replace with real address.
  coverage: 'Todo Santiago', // TODO: replace with real coverage.
  mapUrl: 'https://maps.google.com', // TODO: replace with real map URL.
}

export function buildWhatsappLink(message: string, phoneOverride?: string): string {
  const phone = phoneOverride ?? siteConfig.whatsappNumber
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}
