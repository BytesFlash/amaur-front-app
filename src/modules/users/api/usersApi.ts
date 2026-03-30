import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'

export interface UserDTO {
  id: string
  email: string
  company_id?: string
  patient_id?: string
  first_name: string
  last_name: string
  is_active: boolean
  last_login_at?: string
  roles: string[]
  created_at: string
}

export interface RoleDTO {
  id: string
  name: string
  description: string
  is_system: boolean
}

export interface CreateUserInput {
  email: string
  password: string
  first_name: string
  last_name: string
  rut?: string
  phone?: string
  role_title?: string
  specialty?: string
  availability_notes?: string
  company_id?: string
  patient_id?: string
  role_ids: string[]
}

export interface UpdateUserInput {
  first_name?: string
  last_name?: string
  is_active?: boolean
}

export const usersApi = {
  async list(params?: { page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<UserDTO>>(`/api/v1/users?${qs}`)
    return data
  },

  async getById(id: string): Promise<UserDTO> {
    const { data } = await apiClient.get<ApiResponse<UserDTO>>(`/api/v1/users/${id}`)
    return data.data
  },

  async create(input: CreateUserInput): Promise<UserDTO> {
    const { data } = await apiClient.post<ApiResponse<UserDTO>>('/api/v1/users', input)
    return data.data
  },

  async update(id: string, input: UpdateUserInput): Promise<UserDTO> {
    const { data } = await apiClient.patch<ApiResponse<UserDTO>>(`/api/v1/users/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/users/${id}`)
  },

  async changePassword(id: string, newPassword: string): Promise<void> {
    await apiClient.put(`/api/v1/users/${id}/password`, { new_password: newPassword })
  },

  async assignRoles(id: string, roleIds: string[]): Promise<void> {
    await apiClient.put(`/api/v1/users/${id}/roles`, { role_ids: roleIds })
  },

  async listRoles(): Promise<RoleDTO[]> {
    const { data } = await apiClient.get<ApiResponse<RoleDTO[]>>('/api/v1/roles')
    return data.data
  },
}
