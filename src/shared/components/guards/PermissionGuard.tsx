import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/app/stores/authStore'

interface PermissionGuardProps {
  permission: string
}

export function PermissionGuard({ permission }: PermissionGuardProps) {
  const hasPermission = useAuthStore((s) => s.hasPermission)

  if (!hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
