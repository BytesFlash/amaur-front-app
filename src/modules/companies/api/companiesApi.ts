import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'
import type { Company } from '@/types/company'

export interface CreateCompanyInput extends Partial<Company> {
  admin_email: string
  admin_password: string
  admin_first_name?: string
  admin_last_name?: string
}

export const companiesApi = {
  async list(params?: { search?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.search) qs.set('search', params.search)
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<Company>>(`/api/v1/companies?${qs}`)
    return data
  },

  async getById(id: string): Promise<Company> {
    const { data } = await apiClient.get<ApiResponse<Company>>(`/api/v1/companies/${id}`)
    return data.data
  },

  async create(input: CreateCompanyInput): Promise<Company> {
    const { data } = await apiClient.post<ApiResponse<Company>>('/api/v1/companies', input)
    return data.data
  },

  async update(id: string, input: Partial<Company>): Promise<Company> {
    const { data } = await apiClient.patch<ApiResponse<Company>>(`/api/v1/companies/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/companies/${id}`)
  },

  async listBranches(companyId: string) {
    const { data } = await apiClient.get<{ data: import('@/types/company').CompanyBranch[] }>(`/api/v1/companies/${companyId}/branches`)
    return data.data
  },

  async listPatients(companyId: string, params?: { page?: number; limit?: number }) {
    const qs = new URLSearchParams()
    if (params?.page != null) qs.set('page', String(params.page))
    if (params?.limit != null) qs.set('limit', String(params.limit))
    const { data } = await apiClient.get<PaginatedResponse<CompanyPatient>>(`/api/v1/companies/${companyId}/patients?${qs}`)
    return data
  },
}

export interface CompanyPatient {
  id: string
  first_name: string
  last_name: string
  rut?: string
  email?: string
  phone?: string
  status: string
  patient_type: string
  position?: string
  department?: string
}


