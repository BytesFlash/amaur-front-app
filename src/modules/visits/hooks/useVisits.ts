import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { visitsApi, type CreateVisitInput, type VisitDTO } from '../api/visitsApi'

const KEY = 'visits'

export function useVisits(params?: Parameters<typeof visitsApi.list>[0]) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => visitsApi.list(params) })
}

export function useVisit(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => visitsApi.getById(id), enabled: !!id })
}

export function useCreateVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateVisitInput) => visitsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateVisit(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<VisitDTO>) => visitsApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteVisit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => visitsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
