import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'

export interface AppointmentDTO {
  id: string
  patient_id: string
  patient_name?: string
  worker_id?: string
  worker_name?: string
  service_type_id: string
  service_type_name?: string
  company_id?: string
  company_name?: string
  recurring_group_id?: string
  scheduled_at: string
  duration_minutes?: number
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  chief_complaint?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  follow_up_required?: boolean
  follow_up_notes?: string
  follow_up_date?: string
  care_session_id?: string
  created_at: string
}

export interface CreateAppointmentInput {
  patient_id: string
  worker_id?: string
  service_type_id: string
  company_id?: string
  scheduled_at: string // ISO8601 or "YYYY-MM-DDTHH:MM"
  duration_minutes?: number
  notes?: string
  chief_complaint?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  follow_up_required?: boolean
  follow_up_notes?: string
  follow_up_date?: string
  session_count?: number   // 1 (default) to 12
  frequency_weeks?: number // 1=weekly, 2=biweekly
}

export interface UpdateAppointmentInput {
  worker_id?: string
  service_type_id?: string
  scheduled_at?: string
  duration_minutes?: number
  status?: string
  notes?: string
  chief_complaint?: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  follow_up_required?: boolean
  follow_up_notes?: string
  follow_up_date?: string
}

export const appointmentsApi = {
  async list(params?: {
    patient_id?: string
    worker_id?: string
    company_id?: string
    service_type_id?: string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    limit?: number
  }) {
    const qs = new URLSearchParams()
    if (params?.patient_id) qs.set('patient_id', params.patient_id)
    if (params?.worker_id) qs.set('worker_id', params.worker_id)
    if (params?.company_id) qs.set('company_id', params.company_id)
    if (params?.service_type_id) qs.set('service_type_id', params.service_type_id)
    if (params?.status) qs.set('status', params.status)
    if (params?.date_from) qs.set('date_from', params.date_from)
    if (params?.date_to) qs.set('date_to', params.date_to)
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<AppointmentDTO>>(`/api/v1/appointments?${qs}`)
    return data
  },

  async getById(id: string): Promise<AppointmentDTO> {
    const { data } = await apiClient.get<ApiResponse<AppointmentDTO>>(`/api/v1/appointments/${id}`)
    return data.data
  },

  async create(input: CreateAppointmentInput): Promise<AppointmentDTO[]> {
    const { data } = await apiClient.post<ApiResponse<AppointmentDTO[]>>('/api/v1/appointments', input)
    return data.data
  },

  async update(id: string, input: UpdateAppointmentInput): Promise<AppointmentDTO> {
    const { data } = await apiClient.patch<ApiResponse<AppointmentDTO>>(`/api/v1/appointments/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/appointments/${id}`)
  },
}
