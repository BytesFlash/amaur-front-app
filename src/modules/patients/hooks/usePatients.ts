import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsApi } from '../api/patientsApi'
import type { PatientFilters, CreatePatientInput } from '@/types/patient'

const PATIENTS_KEY = 'patients'

export function usePatients(filters: PatientFilters & { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [PATIENTS_KEY, filters],
    queryFn: () => patientsApi.list(filters),
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, id],
    queryFn: () => patientsApi.getById(id),
    enabled: !!id,
  })
}

export function useClinicalRecord(patientId: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, patientId, 'clinical-record'],
    queryFn: () => patientsApi.getClinicalRecord(patientId),
    enabled: !!patientId,
  })
}

export function usePatientLoginInfo(patientId: string, enabled = true) {
  return useQuery({
    queryKey: [PATIENTS_KEY, patientId, 'login'],
    queryFn: () => patientsApi.getLoginInfo(patientId),
    enabled: !!patientId && enabled,
    // 404 = no active login — not an error to propagate
    retry: false,
  })
}

export function usePatientWards(patientId: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, patientId, 'wards'],
    queryFn: () => patientsApi.getWards(patientId),
    enabled: !!patientId,
  })
}

export function useTutorSearch(search: string) {
  return useQuery({
    queryKey: [PATIENTS_KEY, 'tutor-search', search],
    queryFn: () => patientsApi.searchTutors(search),
    enabled: search.length >= 2,
    staleTime: 10_000,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePatientInput) => patientsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY] }),
  })
}

export function useUpdatePatient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CreatePatientInput>) => patientsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY] })
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY, id] })
    },
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY] }),
  })
}

export function useUpdateClinicalRecord(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof patientsApi.updateClinicalRecord>[1]) =>
      patientsApi.updateClinicalRecord(patientId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PATIENTS_KEY, patientId, 'clinical-record'] }),
  })
}

export function useEnableLogin(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { login_email?: string; login_password: string }) =>
      patientsApi.enableLogin(patientId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY, patientId] })
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY, patientId, 'login'] })
    },
  })
}

export function useDisableLogin(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => patientsApi.disableLogin(patientId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY, patientId] })
      qc.invalidateQueries({ queryKey: [PATIENTS_KEY, patientId, 'login'] })
    },
  })
}
