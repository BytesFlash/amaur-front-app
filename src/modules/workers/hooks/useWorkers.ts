import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workersApi, type CreateWorkerInput, type AvailabilityRuleInput } from '../api/workersApi'

const KEY = 'workers'

export function useWorkers(params?: { search?: string; specialty_code?: string; active?: boolean; page?: number; limit?: number }) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => workersApi.list(params) })
}

export function useWorker(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => workersApi.getById(id), enabled: !!id })
}

export function useCreateWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateWorkerInput) => workersApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateWorker(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Parameters<typeof workersApi.update>[1]) => workersApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useSetWorkerSpecialties(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (codes: string[]) => workersApi.setSpecialties(id, codes),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, id] }),
  })
}

export function useWorkerAvailability(id: string) {
  return useQuery({
    queryKey: [KEY, id, 'availability'],
    queryFn: () => workersApi.getAvailabilityRules(id),
    enabled: !!id,
  })
}

export function useSetWorkerAvailability(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rules: AvailabilityRuleInput[]) => workersApi.setAvailabilityRules(id, rules),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, id, 'availability'] }),
  })
}

export function useWorkerSlots(id: string, weekStart: string, durationMinutes: number) {
  return useQuery({
    queryKey: [KEY, id, 'slots', weekStart, durationMinutes],
    queryFn: () => workersApi.getSlots(id, weekStart, durationMinutes),
    enabled: !!id && !!weekStart && durationMinutes > 0,
    staleTime: 30_000,
  })
}

export function useWorkerCalendar(id: string, month: string) {
  return useQuery({
    queryKey: [KEY, id, 'calendar', month],
    queryFn: () => workersApi.getCalendar(id, month),
    enabled: !!id && !!month,
    staleTime: 60_000,
  })
}

export function useDeleteWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => workersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
