import { apiClient } from '@/shared/api/client'
import type { LoginResponse } from '@/types/auth'

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await apiClient.post<{ data: LoginResponse }>('/api/v1/auth/login', {
      email,
      password,
    })
    return data.data
  },

  async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const { data } = await apiClient.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    })
    return data.data
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout')
  },

  async me() {
    const { data } = await apiClient.get('/api/v1/auth/me')
    return data.data
  },
}
