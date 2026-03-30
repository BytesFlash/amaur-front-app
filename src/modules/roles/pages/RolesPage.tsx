import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useRoles } from '@/modules/users/hooks/useUsers'

export function RolesPage() {
  const { data: roles, isLoading } = useRoles()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles y permisos"
        description="Perfiles de acceso del sistema AMAUR"
      />

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(roles ?? []).map(role => (
            <Card key={role.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="capitalize">{role.name.replace(/_/g, ' ')}</span>
                  <Badge variant="outline" className="text-xs font-mono">{role.name}</Badge>
                </CardTitle>
                {role.description && (
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Los permisos de cada rol se configuran desde el panel de administración del sistema.</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

