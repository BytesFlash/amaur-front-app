import { createColumnHelper } from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { DataTable } from '@/shared/components/ui/DataTable'
import { StatusBadge } from '@/shared/components/ui/StatusBadge'
import { formatDate } from '@/shared/utils/formatDate'
import { formatRut } from '@/shared/utils/formatRut'
import type { Patient } from '@/types/patient'

const col = createColumnHelper<Patient>()

interface PatientTableProps {
  data: Patient[]
  isLoading: boolean
  pageIndex: number
  pageCount: number
  onPageChange: (page: number) => void
  onDelete: (patient: Patient) => void
}

export function PatientTable({
  data,
  isLoading,
  pageIndex,
  pageCount,
  onPageChange,
  onDelete,
}: PatientTableProps) {
  const navigate = useNavigate()

  const columns = [
    col.accessor('rut', {
      header: 'RUT',
      cell: (info) => (
        <span className="font-mono text-sm">{formatRut(info.getValue())}</span>
      ),
    }),
    col.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: 'full_name',
      header: 'Nombre',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    col.accessor('phone', {
      header: 'Teléfono',
      cell: (info) => info.getValue() ?? '—',
    }),
    col.accessor('patient_type', {
      header: 'Tipo',
      cell: (info) => (
        <StatusBadge status={info.getValue()} label={info.getValue() === 'company' ? 'Empresa' : 'Particular'} />
      ),
    }),
    col.accessor('status', {
      header: 'Estado',
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    col.accessor('created_at', {
      header: 'Registrado',
      cell: (info) => formatDate(info.getValue()),
    }),
    col.display({
      id: 'actions',
      cell: ({ row }) => {
        const patient = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(patient)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pageIndex={pageIndex}
      pageCount={pageCount}
      onPageChange={onPageChange}
      emptyMessage="No se encontraron pacientes."
    />
  )
}
