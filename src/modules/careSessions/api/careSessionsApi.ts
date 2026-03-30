import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'

export interface CareSessionDTO {
  id: string
  visit_id?: string
  patient_id: string
  worker_id: string
  service_type_id: string
  company_id?: string
  contract_service_id?: string
  session_type: 'company_visit' | 'particular'
  session_date: string
  session_time?: string
  duration_minutes?: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  chief_complaint?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  notes?: string
  follow_up_required: boolean
  follow_up_status?: string
  follow_up_date?: string
  follow_up_notes?: string
  created_at: string
  updated_at?: string
  // Enrichment
  patient_first_name?: string
  patient_last_name?: string
  worker_first_name?: string
  worker_last_name?: string
  service_type_name?: string
  company_name?: string
}

export interface GroupSessionDTO {
  id: string
  visit_id: string
  service_type_id: string
  worker_id?: string
  attendee_count: number
  session_date: string
  session_time?: string
  duration_minutes?: number
  notes?: string
  created_at: string
  service_type_name?: string
  worker_first_name?: string
  worker_last_name?: string
}

export interface CreateCareSessionInput {
  visit_id?: string
  patient_id: string
  worker_id: string
  service_type_id: string
  company_id?: string
  contract_service_id?: string
  session_type: string
  session_date: string
  session_time?: string
  duration_minutes?: number
  notes?: string
}

export interface UpdateCareSessionInput {
  status?: string
  duration_minutes?: number
  chief_complaint?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  notes?: string
  follow_up_required?: boolean
  follow_up_status?: string
  follow_up_date?: string
  follow_up_notes?: string
}

export interface CreateGroupSessionInput {
  visit_id: string
  service_type_id: string
  worker_id?: string
  attendee_count: number
  session_date: string
  session_time?: string
  duration_minutes?: number
  notes?: string
}

export interface CareSessionFilters {
  patient_id?: string
  worker_id?: string
  company_id?: string
  visit_id?: string
  session_type?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}

export const careSessionsApi = {
  async list(filters: CareSessionFilters = {}) {
    const params = new URLSearchParams()
    if (filters.patient_id) params.set('patient_id', filters.patient_id)
    if (filters.worker_id) params.set('worker_id', filters.worker_id)
    if (filters.company_id) params.set('company_id', filters.company_id)
    if (filters.visit_id) params.set('visit_id', filters.visit_id)
    if (filters.session_type) params.set('session_type', filters.session_type)
    if (filters.status) params.set('status', filters.status)
    if (filters.date_from) params.set('date_from', filters.date_from)
    if (filters.date_to) params.set('date_to', filters.date_to)
    if (filters.page != null) params.set('page', String(filters.page))
    if (filters.limit != null) params.set('limit', String(filters.limit))
    const { data } = await apiClient.get<PaginatedResponse<CareSessionDTO>>(`/api/v1/care-sessions?${params}`)
    return data
  },

  async getById(id: string): Promise<CareSessionDTO> {
    const { data } = await apiClient.get<ApiResponse<CareSessionDTO>>(`/api/v1/care-sessions/${id}`)
    return data.data
  },

  async create(input: CreateCareSessionInput): Promise<CareSessionDTO> {
    const { data } = await apiClient.post<ApiResponse<CareSessionDTO>>('/api/v1/care-sessions', input)
    return data.data
  },

  async update(id: string, input: UpdateCareSessionInput): Promise<CareSessionDTO> {
    const { data } = await apiClient.patch<ApiResponse<CareSessionDTO>>(`/api/v1/care-sessions/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/care-sessions/${id}`)
  },

  async listGroupSessions(visitId: string): Promise<GroupSessionDTO[]> {
    const { data } = await apiClient.get<ApiResponse<GroupSessionDTO[]>>(`/api/v1/agendas/${visitId}/group-sessions`)
    return data.data
  },

  async createGroupSession(visitId: string, input: Omit<CreateGroupSessionInput, 'visit_id'>): Promise<GroupSessionDTO> {
    const { data } = await apiClient.post<ApiResponse<GroupSessionDTO>>(`/api/v1/agendas/${visitId}/group-sessions`, input)
    return data.data
  },
}
