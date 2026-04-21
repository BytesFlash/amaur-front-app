import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi, type CreateAppointmentInput, type UpdateAppointmentInput } from '../api/appointmentsApi'

const KEY = 'appointments'

export function useAppointments(params?: Parameters<typeof appointmentsApi.list>[0]) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => appointmentsApi.list(params) })
}

export function useAppointmentsByPatient(patientId?: string, limit = 50) {
  return useQuery({
    queryKey: [KEY, 'patient', patientId, limit],
    queryFn: () => appointmentsApi.list({ patient_id: patientId, limit }),
    enabled: Boolean(patientId),
  })
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
    onSuccess: async (created) => {
      for (const item of created) {
        qc.setQueryData([KEY, item.id], item)
      }
      await qc.invalidateQueries({ queryKey: [KEY], refetchType: 'all' })
      await qc.invalidateQueries({ queryKey: ['workers'], refetchType: 'all' })
    },
  })
}

export function useUpdateAppointment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAppointmentInput) => appointmentsApi.update(id, input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [KEY], refetchType: 'all' })
      await qc.invalidateQueries({ queryKey: [KEY, id], refetchType: 'all' })
      await qc.invalidateQueries({ queryKey: ['workers'], refetchType: 'all' })
    },
  })
}

export function useDeleteAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: [KEY], refetchType: 'all' })
      await qc.invalidateQueries({ queryKey: ['workers'], refetchType: 'all' })
    },
  })
}
