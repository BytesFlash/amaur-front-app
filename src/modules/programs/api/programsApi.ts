import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'

export interface ProgramDTO {
  id: string
  company_id: string
  contract_id: string
  name: string
  start_date: string
  end_date?: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at?: string
}

export interface ScheduleRuleDTO {
  id: string
  program_id: string
  weekday: number // 0=Sunday, 1=Monday...6=Saturday
  start_time: string // "HH:MM:SS"
  duration_minutes: number
  frequency_interval_weeks: number
  max_occurrences?: number
  service_type_id?: string
  worker_id?: string
}

export interface ScheduleRuleInput {
  weekday: number
  start_time: string
  duration_minutes: number
  frequency_interval_weeks: number
  max_occurrences?: number
  service_type_id?: string
  worker_id?: string
}

export interface AgendaServiceDetailDTO {
  id: string
  agenda_id: string
  service_type_id: string
  service_type_name?: string
  worker_id?: string
  worker_name?: string
  planned_start_time?: string
  planned_duration_minutes?: number
  status: 'planned' | 'completed' | 'cancelled'
  notes?: string
  completed_at?: string
}

export interface AgendaWithServicesDTO {
  id: string
  scheduled_date: string
  scheduled_start?: string
  status: string
  services: AgendaServiceDetailDTO[]
}

export interface ParticipantDetailDTO {
  id: string
  agenda_service_id: string
  patient_id: string
  patient_name?: string
  attended: boolean
  attended_at?: string
  notes?: string
}

export interface ProgramWithRulesDTO {
  program: ProgramDTO
  rules: ScheduleRuleDTO[]
}

export interface ParticipantInput {
  patient_id: string
  attended: boolean
  attended_at?: string
  notes?: string
}

export interface CreateProgramInput {
  company_id: string
  contract_id: string
  name: string
  start_date: string
  end_date?: string
  status?: string
  notes?: string
  rules?: ScheduleRuleInput[]
}

export interface UpdateProgramInput {
  name?: string
  start_date?: string
  end_date?: string
  status?: string
  notes?: string
  rules?: ScheduleRuleInput[]
}

export interface CreateAgendaServiceInput {
  agenda_id: string
  service_type_id: string
  worker_id?: string
  planned_start_time?: string
  planned_duration_minutes?: number
  notes?: string
}

export const programsApi = {
  async list(params?: {
    company_id?: string
    contract_id?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const qs = new URLSearchParams()
    if (params?.company_id) qs.set('company_id', params.company_id)
    if (params?.contract_id) qs.set('contract_id', params.contract_id)
    if (params?.status) qs.set('status', params.status)
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<ProgramDTO>>(`/api/v1/programs?${qs}`)
    return data
  },

  async getById(id: string): Promise<ProgramWithRulesDTO> {
    const { data } = await apiClient.get<ApiResponse<ProgramWithRulesDTO>>(`/api/v1/programs/${id}`)
    return data.data
  },

  async create(input: CreateProgramInput): Promise<ProgramDTO> {
    const { data } = await apiClient.post<ApiResponse<ProgramDTO>>('/api/v1/programs', input)
    return data.data
  },

  async update(id: string, input: UpdateProgramInput): Promise<ProgramDTO> {
    const { data } = await apiClient.patch<ApiResponse<ProgramDTO>>(`/api/v1/programs/${id}`, input)
    return data.data
  },

  async listScheduleRules(id: string): Promise<ScheduleRuleDTO[]> {
    const { data } = await apiClient.get<ApiResponse<ScheduleRuleDTO[]>>(`/api/v1/programs/${id}/rules`)
    return data.data ?? []
  },

  async listProgramAgendas(id: string): Promise<AgendaWithServicesDTO[]> {
    const { data } = await apiClient.get<ApiResponse<AgendaWithServicesDTO[]>>(`/api/v1/programs/${id}/agendas`)
    return data.data ?? []
  },

  async generateAgendas(id: string): Promise<{ count: number; agenda_ids: string[] }> {
    const { data } = await apiClient.post<ApiResponse<{ count: number; agenda_ids: string[] }>>(`/api/v1/programs/${id}/generate-agendas`, {})
    return data.data
  },

  async listAgendaServices(agendaId: string): Promise<AgendaServiceDetailDTO[]> {
    const { data } = await apiClient.get<ApiResponse<AgendaServiceDetailDTO[]>>(`/api/v1/agendas/${agendaId}/services`)
    return data.data ?? []
  },

  async createAgendaService(agendaId: string, input: CreateAgendaServiceInput): Promise<AgendaServiceDetailDTO> {
    const { data } = await apiClient.post<ApiResponse<AgendaServiceDetailDTO>>(`/api/v1/agendas/${agendaId}/services`, input)
    return data.data
  },

  async listParticipants(agendaServiceId: string): Promise<ParticipantDetailDTO[]> {
    const { data } = await apiClient.get<ApiResponse<ParticipantDetailDTO[]>>(`/api/v1/agenda-services/${agendaServiceId}/participants`)
    return data.data ?? []
  },

  async upsertParticipants(agendaServiceId: string, participants: ParticipantInput[]): Promise<void> {
    await apiClient.post(`/api/v1/agenda-services/${agendaServiceId}/participants`, { participants })
  },

  async completeAgendaService(agendaServiceId: string): Promise<void> {
    await apiClient.post(`/api/v1/agenda-services/${agendaServiceId}/complete`, {})
  },
}
