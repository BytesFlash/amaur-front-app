import type { FaqItem } from '@/modules/content/types/cms'

interface FaqListProps {
  title?: string
  faqs: FaqItem[]
}

export function FaqList({ title = 'Preguntas frecuentes', faqs }: FaqListProps) {
  if (!faqs.length) {
    return null
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-6 space-y-3">
        {faqs
          .sort((a, b) => a.order - b.order)
          .map((faq) => (
            <details key={faq.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <summary className="cursor-pointer list-none font-medium text-slate-900">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
      </div>
    </section>
  )
}
