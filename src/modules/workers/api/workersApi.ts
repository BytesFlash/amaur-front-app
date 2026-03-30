import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'
import type { SpecialtyDTO } from '@/shared/api/specialtiesApi'

export interface WorkerDTO {
  id: string
  user_id?: string
  rut?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  role_title?: string
  specialty?: string
  specialties?: SpecialtyDTO[]
  hire_date?: string
  birth_date?: string
  is_active: boolean
  availability_notes?: string
  created_at: string
}

export interface CreateWorkerInput {
  user_id?: string
  login_email?: string
  login_password?: string
  rut?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  role_title?: string
  specialty?: string
  specialty_codes?: string[]
  hire_date?: string
  birth_date?: string
  availability_notes?: string
  internal_notes?: string
}

export const workersApi = {
  async list(params?: { search?: string; specialty_code?: string; active?: boolean; page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.specialty_code) qs.set('specialty_code', params.specialty_code)
    if (params?.active === false) qs.set('active', 'false')
    else if (params?.active === true) qs.set('active', 'true')
    // if active is undefined, backend shows only active by default
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<WorkerDTO>>(`/api/v1/workers?${qs}`)
    return data
  },

  async getById(id: string): Promise<WorkerDTO> {
    const { data } = await apiClient.get<ApiResponse<WorkerDTO>>(`/api/v1/workers/${id}`)
    return data.data
  },

  async create(input: CreateWorkerInput): Promise<WorkerDTO> {
    const { data } = await apiClient.post<ApiResponse<WorkerDTO>>('/api/v1/workers', input)
    return data.data
  },

  async update(id: string, input: Partial<CreateWorkerInput> & { is_active?: boolean; termination_date?: string }): Promise<WorkerDTO> {
    const { data } = await apiClient.patch<ApiResponse<WorkerDTO>>(`/api/v1/workers/${id}`, input)
    return data.data
  },

  async setSpecialties(id: string, codes: string[]): Promise<SpecialtyDTO[]> {
    const { data } = await apiClient.put<ApiResponse<SpecialtyDTO[]>>(`/api/v1/workers/${id}/specialties`, { codes })
    return data.data
  },

  async getAvailabilityRules(id: string): Promise<AvailabilityRuleDTO[]> {
    const { data } = await apiClient.get<ApiResponse<AvailabilityRuleDTO[]>>(`/api/v1/workers/${id}/availability`)
    return data.data ?? []
  },

  async setAvailabilityRules(id: string, rules: AvailabilityRuleInput[]): Promise<AvailabilityRuleDTO[]> {
    const { data } = await apiClient.put<ApiResponse<AvailabilityRuleDTO[]>>(`/api/v1/workers/${id}/availability`, { rules })
    return data.data
  },

  async getSlots(id: string, weekStart: string, durationMinutes: number): Promise<TimeSlotDTO[]> {
    const qs = new URLSearchParams({ week_start: weekStart, duration_minutes: String(durationMinutes) })
    const { data } = await apiClient.get<ApiResponse<TimeSlotDTO[]>>(`/api/v1/workers/${id}/slots?${qs}`)
    return data.data
  },

  async getCalendar(id: string, month: string): Promise<DayCalendarDTO[]> {
    const { data } = await apiClient.get<ApiResponse<DayCalendarDTO[]>>(
      `/api/v1/workers/${id}/calendar?month=${month}`
    )
    return data.data ?? []
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/workers/${id}`)
  },
}

export interface AvailabilityRuleDTO {
  id: string
  worker_id: string
  weekday: number // 0=Sunday…6=Saturday
  start_time: string // "HH:MM"
  end_time: string   // "HH:MM"
  is_active: boolean
}

export interface AvailabilityRuleInput {
  weekday: number
  start_time: string
  end_time: string
}

export interface TimeSlotDTO {
  date: string       // "YYYY-MM-DD"
  weekday: number
  start_time: string // "HH:MM"
  end_time: string   // "HH:MM"
  available: boolean
}

export interface DayCalendarDTO {
  date: string              // "YYYY-MM-DD"
  total_minutes: number
  available_minutes: number
  booked_minutes: number
  appointments: {
    scheduled_at: string    // "HH:MM"
    duration_minutes: number
    type: 'individual' | 'group'
    label: string
  }[]
}
