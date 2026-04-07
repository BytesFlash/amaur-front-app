import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-xl space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">404 - Ruta no encontrada</h1>
      <p className="text-muted-foreground">
        La pagina que intentas abrir no existe o fue movida.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Volver</Button>
        <Button onClick={() => navigate('/app/dashboard')}>Ir al dashboard</Button>
      </div>
    </div>
  )
}
