import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

interface CtaBannerProps {
  title: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
}

export function CtaBanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: CtaBannerProps) {
  return (
    <section className="rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-8 sm:px-8">
      <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">{description}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="rounded-full bg-slate-900 text-white hover:bg-slate-800">
          <Link to={primaryHref}>
            {primaryLabel}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        {secondaryLabel && secondaryHref && (
          <Button asChild variant="outline" className="rounded-full">
            <Link to={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  )
}
