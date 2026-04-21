import type { Testimonial } from '@/modules/content/types/cms'

export const testimonialsSeed: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Camila R.',
    role: 'Paciente de kinesiologia',
    quote: 'En pocas semanas disminuyo el dolor lumbar y pude volver a entrenar sin miedo.',
    source: 'Google Reviews',
    rating: 5,
  },
  {
    id: 'test-2',
    author: 'Jefe de Personas, empresa logistica',
    role: 'Programa de bienestar laboral',
    quote: 'Las pausas activas mejoraron energia y redujeron molestias reportadas por el equipo.',
    source: 'Caso corporativo',
    rating: 5,
  },
  {
    id: 'test-3',
    author: 'Marcelo G.',
    role: 'Terapia ocupacional',
    quote: 'Recupere autonomia para tareas diarias y ordene mejor mis rutinas.',
    source: 'Encuesta interna',
    rating: 5,
  },
]
