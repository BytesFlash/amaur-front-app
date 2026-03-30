import { apiClient } from './client'
import type { ApiResponse } from './types'

export interface SpecialtyDTO {
  code: string
  name: string
}

export const specialtiesApi = {
  async list(): Promise<SpecialtyDTO[]> {
    const { data } = await apiClient.get<ApiResponse<SpecialtyDTO[]>>('/api/v1/specialties')
    return data.data
  },

  async create(code: string, name: string): Promise<SpecialtyDTO> {
    const { data } = await apiClient.post<ApiResponse<SpecialtyDTO>>('/api/v1/specialties', { code, name })
    return data.data
  },

  async remove(code: string): Promise<void> {
    await apiClient.delete(`/api/v1/specialties/${encodeURIComponent(code)}`)
  },
}
