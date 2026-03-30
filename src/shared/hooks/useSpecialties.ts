import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { specialtiesApi } from '@/shared/api/specialtiesApi'

export function useSpecialties() {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesApi.list(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateSpecialty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ code, name }: { code: string; name: string }) => specialtiesApi.create(code, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specialties'] }),
  })
}

export function useDeleteSpecialty() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => specialtiesApi.remove(code),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specialties'] }),
  })
}
