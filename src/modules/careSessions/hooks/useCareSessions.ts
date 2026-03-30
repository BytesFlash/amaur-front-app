import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  careSessionsApi,
  type CareSessionFilters,
  type CreateCareSessionInput,
  type UpdateCareSessionInput,
  type CreateGroupSessionInput,
} from '../api/careSessionsApi'

export function useCareSessions(filters: CareSessionFilters = {}) {
  return useQuery({
    queryKey: ['care-sessions', filters],
    queryFn: () => careSessionsApi.list(filters),
  })
}

export function useCareSession(id: string) {
  return useQuery({
    queryKey: ['care-session', id],
    queryFn: () => careSessionsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateCareSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateCareSessionInput) => careSessionsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['care-sessions'] }),
  })
}

export function useUpdateCareSession(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCareSessionInput) => careSessionsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['care-sessions'] })
      qc.invalidateQueries({ queryKey: ['care-session', id] })
    },
  })
}

export function useDeleteCareSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => careSessionsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['care-sessions'] }),
  })
}

export function useGroupSessions(visitId: string) {
  return useQuery({
    queryKey: ['group-sessions', visitId],
    queryFn: () => careSessionsApi.listGroupSessions(visitId),
    enabled: !!visitId,
  })
}

export function useCreateGroupSession(visitId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<CreateGroupSessionInput, 'visit_id'>) =>
      careSessionsApi.createGroupSession(visitId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['group-sessions', visitId] }),
  })
}
