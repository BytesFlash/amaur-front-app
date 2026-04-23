export interface ServiceImageAsset {
  hero: string
  gallery: string[]
  alt: string
}

const fallbackImage = '/assets/brand/amaur-logo-dark.png'

export const serviceImageAssets: Record<string, ServiceImageAsset> = {
  kinesiologia: {
    hero: '/assets/services/ejercicio-kinesiologia-dolor-de-cuello.png',
    gallery: [
      'https://images.pexels.com/photos/14797757/pexels-photo-14797757.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/20860615/pexels-photo-20860615.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/20860589/pexels-photo-20860589.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    alt: 'Sesion de kinesiologia en consulta clinica',
  },
  'terapia-ocupacional': {
    hero: 'https://images.pexels.com/photos/5794056/pexels-photo-5794056.jpeg?auto=compress&cs=tinysrgb&w=1400',
    gallery: [
      'https://images.pexels.com/photos/14797757/pexels-photo-14797757.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/20860584/pexels-photo-20860584.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/20860618/pexels-photo-20860618.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    alt: 'Terapia ocupacional enfocada en funcionalidad diaria',
  },
  telemedicina: {
    hero: 'https://images.pexels.com/photos/7195091/pexels-photo-7195091.jpeg?auto=compress&cs=tinysrgb&w=1400',
    gallery: [
      'https://images.pexels.com/photos/8376207/pexels-photo-8376207.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/7195091/pexels-photo-7195091.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/4225920/pexels-photo-4225920.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    alt: 'Consulta de telemedicina por videollamada',
  },
  'masajes-descontracturantes': {
    hero: 'https://images.pexels.com/photos/19641817/pexels-photo-19641817.jpeg?auto=compress&cs=tinysrgb&w=1400',
    gallery: [
      'https://images.pexels.com/photos/19641817/pexels-photo-19641817.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/6663362/pexels-photo-6663362.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    alt: 'Masaje descontracturante en espalda',
  },
  'masajes-relajacion': {
    hero: 'https://images.pexels.com/photos/9146381/pexels-photo-9146381.jpeg?auto=compress&cs=tinysrgb&w=1400',
    gallery: [
      'https://images.pexels.com/photos/9146381/pexels-photo-9146381.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/5240634/pexels-photo-5240634.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    alt: 'Sesion de masaje de relajacion en ambiente terapeutico',
  },
  'pausas-activas': {
    hero: 'https://images.pexels.com/photos/6339343/pexels-photo-6339343.jpeg?auto=compress&cs=tinysrgb&w=1400',
    gallery: [
      'https://images.pexels.com/photos/6339343/pexels-photo-6339343.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/6339353/pexels-photo-6339353.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/6339336/pexels-photo-6339336.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    alt: 'Pausa activa grupal para equipos de trabajo',
  },
  'bienestar-empresarial': {
    hero: 'https://images.pexels.com/photos/6339336/pexels-photo-6339336.jpeg?auto=compress&cs=tinysrgb&w=1400',
    gallery: [
      'https://images.pexels.com/photos/6339336/pexels-photo-6339336.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/6339343/pexels-photo-6339343.jpeg?auto=compress&cs=tinysrgb&w=1200',
      'https://images.pexels.com/photos/11440885/pexels-photo-11440885.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ],
    alt: 'Programa de bienestar empresarial para equipos',
  },
}

export function getServiceHeroImage(slug: string, fallback?: string): string {
  return serviceImageAssets[slug]?.hero ?? fallback ?? fallbackImage
}

export function getServiceGalleryImages(slug: string, fallback?: string): string[] {
  const images = serviceImageAssets[slug]?.gallery
  if (images && images.length > 0) {
    return images
  }
  return [fallback ?? fallbackImage]
}

export function getServiceImageAlt(slug: string, serviceName: string): string {
  return serviceImageAssets[slug]?.alt ?? `Imagen del servicio ${serviceName} en AMAUR`
}
