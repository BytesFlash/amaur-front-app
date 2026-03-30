import { useAuthStore } from '@/app/stores/authStore'

export function usePermission() {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const hasRole = useAuthStore((s) => s.hasRole)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return { hasPermission, hasRole, user, isAuthenticated }
}
