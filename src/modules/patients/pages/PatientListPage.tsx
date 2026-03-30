import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { PatientTable } from '../components/PatientTable'
import { usePatients, useDeletePatient } from '../hooks/usePatients'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { usePermission } from '@/shared/hooks/usePermission'
import type { Patient } from '@/types/patient'

const PAGE_SIZE = 20

export function PatientListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [patientType, setPatientType] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [toDelete, setToDelete] = useState<Patient | null>(null)

  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading } = usePatients({
    search: debouncedSearch || undefined,
    status: status !== 'all' ? status : undefined,
    patient_type: patientType !== 'all' ? patientType : undefined,
    page: page + 1,
    limit: PAGE_SIZE,
  })

  const deleteMutation = useDeletePatient()

  async function handleDelete() {
    if (!toDelete) return
    await deleteMutation.mutateAsync(toDelete.id)
    setToDelete(null)
  }

  const patients = data?.data ?? []
  const pageCount = data ? Math.ceil(data.meta.total / PAGE_SIZE) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        description={`${data?.meta.total ?? 0} registros`}
        actions={
          hasPermission('patients:create') ? (
            <Button onClick={() => navigate('/patients/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo paciente
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, RUT, correo…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(0) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="prospect">Prospecto</SelectItem>
            <SelectItem value="patient">Paciente</SelectItem>
            <SelectItem value="discharged">Alta</SelectItem>
            <SelectItem value="suspended">Suspendido</SelectItem>
          </SelectContent>
        </Select>

        <Select value={patientType} onValueChange={(v) => { setPatientType(v); setPage(0) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="company">Empresa</SelectItem>
            <SelectItem value="particular">Particular</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PatientTable
        data={patients}
        isLoading={isLoading}
        pageIndex={page}
        pageCount={pageCount}
        onPageChange={setPage}
        onDelete={setToDelete}
      />

      {/* Delete confirm dialog */}
      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará a{' '}
              <strong>{toDelete?.first_name} {toDelete?.last_name}</strong>. Los datos no se
              pierden de forma permanente pero el registro quedará archivado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
