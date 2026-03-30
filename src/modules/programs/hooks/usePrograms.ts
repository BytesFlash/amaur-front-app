import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { programsApi, type CreateProgramInput, type UpdateProgramInput, type ParticipantInput, type CreateAgendaServiceInput } from '../api/programsApi'

const KEY = 'programs'

export function usePrograms(params?: Parameters<typeof programsApi.list>[0]) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => programsApi.list(params) })
}

export function useProgram(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => programsApi.getById(id),
    enabled: !!id,
  })
}

export function useProgramAgendas(id: string) {
  return useQuery({
    queryKey: [KEY, id, 'agendas'],
    queryFn: () => programsApi.listProgramAgendas(id),
    enabled: !!id,
  })
}

export function useAgendaServices(agendaId: string) {
  return useQuery({
    queryKey: ['agenda-services', agendaId],
    queryFn: () => programsApi.listAgendaServices(agendaId),
    enabled: !!agendaId,
  })
}

export function useParticipants(agendaServiceId: string) {
  return useQuery({
    queryKey: ['participants', agendaServiceId],
    queryFn: () => programsApi.listParticipants(agendaServiceId),
    enabled: !!agendaServiceId,
  })
}

export function useCreateProgram() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateProgramInput) => programsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateProgram(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProgramInput) => programsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: [KEY, id] })
    },
  })
}

export function useGenerateAgendas(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => programsApi.generateAgendas(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, id, 'agendas'] }),
  })
}

export function useCreateAgendaService(agendaId: string, programId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAgendaServiceInput) => programsApi.createAgendaService(agendaId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agenda-services', agendaId] })
      // Refresh the program's agenda list so service counts update
      if (programId) qc.invalidateQueries({ queryKey: [KEY, programId, 'agendas'] })
    },
  })
}

export function useUpsertParticipants(agendaServiceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (participants: ParticipantInput[]) => programsApi.upsertParticipants(agendaServiceId, participants),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['participants', agendaServiceId] }),
  })
}

export function useCompleteAgendaService(programId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (agendaServiceId: string) => programsApi.completeAgendaService(agendaServiceId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agenda-services'] })
      qc.invalidateQueries({ queryKey: ['participants'] })
      // Refresh the program's agenda list so status updates
      if (programId) qc.invalidateQueries({ queryKey: [KEY, programId, 'agendas'] })
    },
  })
}
