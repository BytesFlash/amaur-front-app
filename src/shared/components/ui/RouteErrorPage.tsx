import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

export function RouteErrorPage() {
  const navigate = useNavigate()
  const error = useRouteError()

  let title = 'Error inesperado'
  let description = 'Ocurrio un problema al cargar esta vista.'

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    description = typeof error.data === 'string' ? error.data : description
  } else if (error instanceof Error) {
    description = error.message
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
        <Button onClick={() => navigate('/dashboard')}>Ir al dashboard</Button>
      </div>
    </div>
  )
}
