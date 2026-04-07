import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <ShieldX className="h-16 w-16 text-destructive" />
      <div>
        <h1 className="text-3xl font-bold">Acceso denegado</h1>
        <p className="mt-2 text-muted-foreground">
          No tienes permisos para ver esta página.
        </p>
      </div>
      <Button asChild>
        <Link to="/app/dashboard">Volver al inicio</Link>
      </Button>
    </div>
  )
}
