import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Pencil, MapPin, Phone, Mail, Globe, Users } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { Badge } from '@/shared/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { useCompany, useCompanyBranches, useCompanyPatients } from '../hooks/useCompanies'

const STATUS_LABELS: Record<string, string> = { active: 'Activa', inactive: 'Inactiva', prospect: 'Prospecto', churned: 'Baja' }
const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default', prospect: 'secondary', inactive: 'outline', churned: 'destructive',
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: company, isLoading } = useCompany(id!)
  const { data: branches } = useCompanyBranches(id!)
  const { data: patientsRes } = useCompanyPatients(id!)
  const patients = (patientsRes as any)?.data ?? []

  if (isLoading) return <div className="p-8 text-center">Cargando...</div>
  if (!company) return <div className="p-8 text-center text-muted-foreground">Empresa no encontrada</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader
            title={company.name}
            description={company.fantasy_name ? `Nombre de fantasÃ­a: ${company.fantasy_name}` : undefined}
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_VARIANTS[company.status] ?? 'outline'}>{STATUS_LABELS[company.status] ?? company.status}</Badge>
          <Button onClick={() => navigate(`/companies/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />Editar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>InformaciÃ³n general</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <InfoRow label="RUT" value={company.rut} />
            <InfoRow label="Industria" value={company.industry} />
            <InfoRow label="TamaÃ±o" value={company.size_category} />
            <InfoRow label="Origen" value={company.lead_source} />
            <InfoRow label="Ciudad" value={company.city} />
            <InfoRow label="RegiÃ³n" value={company.region} />
            <InfoRow label="DirecciÃ³n" value={company.address} />
            {company.website && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Sitio web</span>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium flex items-center gap-1 text-primary hover:underline">
                  <Globe className="h-3 w-3" />{company.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contacto</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {company.contact_name && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{company.contact_name}</span>
              </div>
            )}
            {company.contact_email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />{company.contact_email}
              </div>
            )}
            {company.contact_phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />{company.contact_phone}
              </div>
            )}
            {company.billing_email && (
              <>
                <Separator />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Email de facturaciÃ³n</span>
                  <span className="text-sm">{company.billing_email}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {company.commercial_notes && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Notas comerciales</CardTitle></CardHeader>
            <CardContent><p className="text-sm">{company.commercial_notes}</p></CardContent>
          </Card>
        )}

        {patients.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />Pacientes asociados ({patients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {patients.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div>
                      <Link to={`/patients/${p.id}`} className="text-sm font-medium hover:underline text-primary">
                        {p.first_name} {p.last_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.rut}{p.position ? ` — ${p.position}` : ''}</p>
                    </div>
                    <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {p.status === 'active' ? 'Activo' : p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {branches && branches.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Sucursales</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {branches.map(b => (
                  <div key={b.id} className="rounded-lg border p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{b.name}</span>
                      {b.is_main && <Badge variant="outline" className="text-xs">Principal</Badge>}
                      {!b.is_active && <Badge variant="secondary" className="text-xs">Inactiva</Badge>}
                    </div>
                    {b.address && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />{b.address}{b.city ? `, ${b.city}` : ''}
                      </div>
                    )}
                    {b.contact_name && <div className="text-xs text-muted-foreground">{b.contact_name}</div>}
                    {b.contact_phone && <div className="text-xs text-muted-foreground">{b.contact_phone}</div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

