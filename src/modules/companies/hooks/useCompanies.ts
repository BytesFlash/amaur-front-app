import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companiesApi, type CreateCompanyInput } from '../api/companiesApi'
import type { Company } from '@/types/company'

const KEY = 'companies'

export function useCompanies(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => companiesApi.list(params) })
}

export function useCompany(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => companiesApi.getById(id), enabled: !!id })
}

export function useCompanyBranches(companyId: string) {
  return useQuery({ queryKey: [KEY, companyId, 'branches'], queryFn: () => companiesApi.listBranches(companyId), enabled: !!companyId })
}

export function useCompanyPatients(companyId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: [KEY, companyId, 'patients', params],
    queryFn: () => companiesApi.listPatients(companyId, params),
    enabled: !!companyId,
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCompanyInput) => companiesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<Company>) => companiesApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => companiesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
