import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import type { BreadcrumbItem } from '@/modules/content/types/cms'

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length <= 1) {
    return null
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.href}-${item.label}`} className="flex items-center gap-2">
              {isLast ? (
                <span className="font-medium text-slate-900">{item.label}</span>
              ) : (
                <Link to={item.href} className="hover:text-slate-900">
                  {item.label}
                </Link>
              )}
              {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
