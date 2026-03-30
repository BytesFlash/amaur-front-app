import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'

export interface VisitWorkerDTO {
  visit_id: string
  worker_id: string
  role_in_visit: string
  first_name?: string
  last_name?: string
  role_title?: string
}

export interface VisitDTO {
  id: string
  company_id: string
  company_name?: string
  company_fantasy_name?: string
  branch_id?: string
  contract_id?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  scheduled_date: string
  scheduled_start?: string
  scheduled_end?: string
  actual_start?: string
  actual_end?: string
  coordinator_user_id?: string
  general_notes?: string
  cancellation_reason?: string
  internal_report?: string
  created_at: string
  workers?: VisitWorkerDTO[]
}

export interface CreateVisitInput {
  company_id: string
  branch_id?: string
  contract_id?: string
  scheduled_date: string
  scheduled_start?: string
  scheduled_end?: string
  general_notes?: string
  worker_ids?: string[]
}

export const visitsApi = {
  async list(params?: { company_id?: string; status?: string; date_from?: string; date_to?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.company_id) qs.set('company_id', params.company_id)
    if (params?.status) qs.set('status', params.status)
    if (params?.date_from) qs.set('date_from', params.date_from)
    if (params?.date_to) qs.set('date_to', params.date_to)
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<VisitDTO>>(`/api/v1/agendas?${qs}`)
    return data
  },

  async getById(id: string): Promise<VisitDTO> {
    const { data } = await apiClient.get<ApiResponse<VisitDTO>>(`/api/v1/agendas/${id}`)
    return data.data
  },

  async create(input: CreateVisitInput): Promise<VisitDTO> {
    const { data } = await apiClient.post<ApiResponse<VisitDTO>>('/api/v1/agendas', input)
    return data.data
  },

  async update(id: string, input: Partial<VisitDTO>): Promise<VisitDTO> {
    const { data } = await apiClient.patch<ApiResponse<VisitDTO>>(`/api/v1/agendas/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/agendas/${id}`)
  },
}
