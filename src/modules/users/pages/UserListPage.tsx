import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreHorizontal, Pencil, Trash2, KeyRound } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { PageHeader } from '@/shared/components/ui/PageHeader'
import { DataTable } from '@/shared/components/ui/DataTable'
import { useUsers, useDeleteUser } from '../hooks/useUsers'
import { usePermission } from '@/shared/hooks/usePermission'
import { formatDate } from '@/shared/utils/formatDate'
import { createColumnHelper } from '@tanstack/react-table'
import type { UserDTO } from '../api/usersApi'
import { toast } from 'sonner'

const col = createColumnHelper<UserDTO>()
const PAGE_SIZE = 20

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-100 text-red-800',
  admin: 'bg-orange-100 text-orange-800',
  coordinator: 'bg-blue-100 text-blue-800',
  professional: 'bg-green-100 text-green-800',
  receptionist: 'bg-purple-100 text-purple-800',
  read_only: 'bg-gray-100 text-gray-700',
}

export function UserListPage() {
  const navigate = useNavigate()
  const { hasPermission } = usePermission()
  const [page, setPage] = useState(0)
  const [toDelete, setToDelete] = useState<UserDTO | null>(null)

  const { data, isLoading } = useUsers({ page: page + 1, limit: PAGE_SIZE })
  const deleteMutation = useDeleteUser()

  const columns = [
    col.accessor((r) => `${r.first_name} ${r.last_name}`, {
      id: 'name', header: 'Nombre',
      cell: (i) => <span className="font-medium">{i.getValue()}</span>,
    }),
    col.accessor('email', { header: 'Correo' }),
    col.accessor('roles', {
      header: 'Roles',
      cell: (i) => (
        <div className="flex flex-wrap gap-1">
          {i.getValue().map((r) => (
            <span key={r} className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[r] ?? 'bg-gray-100 text-gray-700'}`}>
              {r}
            </span>
          ))}
        </div>
      ),
    }),
    col.accessor('is_active', {
      header: 'Estado',
      cell: (i) => <Badge variant={i.getValue() ? 'default' : 'secondary'}>{i.getValue() ? 'Activo' : 'Inactivo'}</Badge>,
    }),
    col.accessor('last_login_at', {
      header: 'Último acceso',
      cell: (i) => formatDate(i.getValue() ?? null),
    }),
    col.display({
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasPermission('users:edit') && (
                  <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/edit`)}>
                    <Pencil className="mr-2 h-4 w-4" />Editar
                  </DropdownMenuItem>
                )}
                {hasPermission('users:edit') && (
                  <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/password`)}>
                    <KeyRound className="mr-2 h-4 w-4" />Cambiar contraseña
                  </DropdownMenuItem>
                )}
                {hasPermission('users:delete') && (
                  <DropdownMenuItem onClick={() => setToDelete(user)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    }),
  ]

  async function handleDelete() {
    if (!toDelete) return
    await deleteMutation.mutateAsync(toDelete.id)
    toast.success('Usuario eliminado')
    setToDelete(null)
  }

  const users = data?.data ?? []
  const pageCount = data ? Math.ceil(data.meta.total / PAGE_SIZE) : 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description={`${data?.meta.total ?? 0} registros`}
        actions={
          hasPermission('users:create') ? (
            <Button onClick={() => navigate('/users/new')}>
              <Plus className="mr-2 h-4 w-4" />Nuevo usuario
            </Button>
          ) : undefined
        }
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pageIndex={page}
        pageCount={pageCount}
        onPageChange={setPage}
        emptyMessage="No se encontraron usuarios."
      />

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará a <strong>{toDelete?.first_name} {toDelete?.last_name}</strong> ({toDelete?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
