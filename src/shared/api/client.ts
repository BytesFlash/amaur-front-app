import axios from 'axios'
import { useAuthStore } from '@/app/stores/authStore'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request: attach Authorization header ─────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response: handle 401 → refresh token ─────────────────────────────────────
let isRefreshing = false
let pendingQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)))
  pendingQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as { _retry?: boolean; url?: string; headers: Record<string, string> }

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Avoid refresh recursion on auth endpoints.
    if (originalRequest.url?.includes('/api/v1/auth/refresh') || originalRequest.url?.includes('/api/v1/auth/login')) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = useAuthStore.getState().refreshToken

      if (!refreshToken) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const newToken: string = data.data.access_token
        const newRefresh: string = data.data.refresh_token

        // Update auth state with rotated tokens only when user state exists.
        const currentUser = useAuthStore.getState().user
        if (!currentUser) {
          useAuthStore.getState().logout()
          window.location.href = '/login'
          return Promise.reject(error)
        }
        useAuthStore.getState().setAuth(currentUser, newToken, newRefresh)

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (err) {
        processQueue(err, null)
        useAuthStore.getState().logout()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)
