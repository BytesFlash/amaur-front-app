import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi, type CreateAppointmentInput, type UpdateAppointmentInput } from '../api/appointmentsApi'

const KEY = 'appointments'

export function useAppointments(params?: Parameters<typeof appointmentsApi.list>[0]) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => appointmentsApi.list(params) })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => appointmentsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateAppointmentInput) => appointmentsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAppointmentInput) => appointmentsApi.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] })
      qc.invalidateQueries({ queryKey: [KEY, id] })
    },
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
