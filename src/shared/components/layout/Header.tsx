import { useNavigate } from 'react-router-dom'
import { Bell, LogOut, User } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { useAuthStore } from '@/app/stores/authStore'
import { authApi } from '@/modules/auth/api/authApi'

export function Header() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : '?'

  async function handleLogout() {
    try {
      await authApi.logout()
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-white/65 px-6 backdrop-blur-xl">
      <div />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl p-1 hover:bg-secondary">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {user && (
                <span className="hidden text-sm font-medium md:inline-block">
                  {user.first_name} {user.last_name}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="font-normal">
              <p className="text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/app/settings')}>
              <User className="mr-2 h-4 w-4" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
