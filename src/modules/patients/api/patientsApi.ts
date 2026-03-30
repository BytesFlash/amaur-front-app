import { apiClient } from '@/shared/api/client'
import type { PaginatedResponse, ApiResponse } from '@/shared/api/types'
import type { Patient, PatientDetail, ClinicalRecord, PatientFilters, CreatePatientInput, PatientLoginInfo, TutorInfo } from '@/types/patient'

export const patientsApi = {
  async list(filters: PatientFilters & { page?: number; limit?: number }) {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.patient_type) params.set('patient_type', filters.patient_type)
    if (filters.company_id) params.set('company_id', filters.company_id)
    if (filters.follow_up_pending) params.set('follow_up_pending', 'true')
    if (filters.page != null) params.set('page', String(filters.page))
    if (filters.limit != null) params.set('limit', String(filters.limit))

    const { data } = await apiClient.get<PaginatedResponse<Patient>>(`/api/v1/patients?${params}`)
    return data
  },

  async getById(id: string): Promise<PatientDetail> {
    const { data } = await apiClient.get<ApiResponse<PatientDetail>>(`/api/v1/patients/${id}`)
    return data.data
  },

  async create(input: CreatePatientInput): Promise<PatientDetail> {
    const { data } = await apiClient.post<ApiResponse<PatientDetail>>('/api/v1/patients', input)
    return data.data
  },

  async update(id: string, input: Partial<CreatePatientInput>): Promise<PatientDetail> {
    const { data } = await apiClient.put<ApiResponse<PatientDetail>>(`/api/v1/patients/${id}`, input)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/patients/${id}`)
  },

  async getClinicalRecord(patientId: string): Promise<ClinicalRecord> {
    const { data } = await apiClient.get<ApiResponse<ClinicalRecord>>(
      `/api/v1/patients/${patientId}/clinical-record`
    )
    return data.data
  },

  async updateClinicalRecord(
    patientId: string,
    input: Partial<ClinicalRecord>
  ): Promise<ClinicalRecord> {
    const { data } = await apiClient.put<ApiResponse<ClinicalRecord>>(
      `/api/v1/patients/${patientId}/clinical-record`,
      input
    )
    return data.data
  },

  /** Returns the current portal login account for a patient (auth email, roles, active). */
  async getLoginInfo(patientId: string): Promise<PatientLoginInfo> {
    const { data } = await apiClient.get<ApiResponse<PatientLoginInfo>>(
      `/api/v1/patients/${patientId}/login`
    )
    return data.data
  },

  /** Enables (or reactivates) portal login for a patient. */
  async enableLogin(patientId: string, input: { login_email?: string; login_password: string }): Promise<void> {
    await apiClient.post(`/api/v1/patients/${patientId}/login`, input)
  },

  /** Disables the portal login for a patient. */
  async disableLogin(patientId: string): Promise<void> {
    await apiClient.delete(`/api/v1/patients/${patientId}/login`)
  },

  /** Returns the list of minor patients tutored by the given patient. */
  async getWards(patientId: string): Promise<TutorInfo[]> {
    const { data } = await apiClient.get<ApiResponse<TutorInfo[]>>(
      `/api/v1/patients/${patientId}/wards`
    )
    return data.data
  },

  /** Searches for adult patients to use as tutor suggestions. */
  async searchTutors(search: string): Promise<Patient[]> {
    const params = new URLSearchParams({ search, limit: '20' })
    const { data } = await apiClient.get<PaginatedResponse<Patient>>(`/api/v1/patients?${params}`)
    return data.data ?? []
  },
}
