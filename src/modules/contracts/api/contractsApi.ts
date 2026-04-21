import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'

export interface ContractDTO {
  id: string
  company_id: string
  name: string
  contract_type?: 'mensual' | 'anual' | 'paquete' | 'puntual'
  status: 'draft' | 'active' | 'paused' | 'expired' | 'terminated'
  start_date: string
  end_date?: string
  renewal_date?: string
  value_clp?: number
  billing_cycle?: string
  notes?: string
  signed_document_url?: string
  created_at: string
}

export interface ContractServiceDTO {
  id: string
  contract_id: string
  service_type_id: string
  service_type_name?: string
  quota_type: 'sessions' | 'hours' | 'unlimited'
  quantity_per_period?: number
  period_unit?: 'month' | 'week' | 'total'
  sessions_included?: number
  sessions_used: number
  hours_included?: number
  hours_used: number
  price_per_unit?: number
  notes?: string
}

export interface ContractServiceInput {
  id?: string
  service_type_id: string
  quota_type: 'sessions' | 'hours' | 'unlimited'
  quantity_per_period?: number
  period_unit?: 'month' | 'week' | 'total'
  sessions_included?: number
  hours_included?: number
  price_per_unit?: number
  notes?: string
}

export interface CreateContractInput {
  company_id: string
  name: string
  contract_type?: string
  status?: string
  start_date: string
  end_date?: string
  renewal_date?: string
  value_clp?: number
  billing_cycle?: string
  notes?: string
  services?: ContractServiceInput[]
}

export const contractsApi = {
  async list(params?: { company_id?: string; status?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.company_id) qs.set('company_id', params.company_id)
    if (params?.status) qs.set('status', params.status)
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<ContractDTO>>(`/api/v1/contracts?${qs}`)
    return data
  },

  async getById(id: string): Promise<ContractDTO> {
    const { data } = await apiClient.get<ApiResponse<ContractDTO>>(`/api/v1/contracts/${id}`)
    return data.data
  },

  async create(input: CreateContractInput): Promise<ContractDTO> {
    const { data } = await apiClient.post<ApiResponse<ContractDTO>>('/api/v1/contracts', input)
    return data.data
  },

  async update(id: string, input: Partial<CreateContractInput>): Promise<ContractDTO> {
    const { data } = await apiClient.patch<ApiResponse<ContractDTO>>(`/api/v1/contracts/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/contracts/${id}`)
  },

  async listServices(id: string): Promise<ContractServiceDTO[]> {
    const { data } = await apiClient.get<{ data: ContractServiceDTO[] }>(`/api/v1/contracts/${id}/services`)
    return data.data
  },
}
