import { apiClient } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { SpecialtyDTO } from '@/shared/api/specialtiesApi'

export interface ServiceTypeDTO {
  id: string
  name: string
  category?: string
  description?: string
  default_duration_minutes?: number
  is_group_service: boolean
  requires_clinical_record: boolean
  is_active: boolean
  created_at: string
  specialties?: SpecialtyDTO[]
}

export interface CreateServiceTypeInput {
  name: string
  category?: string
  description?: string
  default_duration_minutes?: number
  is_group_service: boolean
  requires_clinical_record: boolean
  specialty_codes?: string[]
}

export interface UpdateServiceTypeInput {
  name?: string
  category?: string
  description?: string
  default_duration_minutes?: number
  is_group_service?: boolean
  requires_clinical_record?: boolean
  is_active?: boolean
  specialty_codes?: string[]
}

export const serviceTypesApi = {
  async list(activeOnly = true): Promise<ServiceTypeDTO[]> {
    const { data } = await apiClient.get<ApiResponse<ServiceTypeDTO[]>>(
      `/api/v1/service-types?active=${activeOnly}`
    )
    return data.data
  },

  async create(input: CreateServiceTypeInput): Promise<ServiceTypeDTO> {
    const { data } = await apiClient.post<ApiResponse<ServiceTypeDTO>>('/api/v1/service-types', input)
    return data.data
  },

  async update(id: string, input: UpdateServiceTypeInput): Promise<ServiceTypeDTO> {
    const { data } = await apiClient.patch<ApiResponse<ServiceTypeDTO>>(`/api/v1/service-types/${id}`, input)
    return data.data
  },
}
