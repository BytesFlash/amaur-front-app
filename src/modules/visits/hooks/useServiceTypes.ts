import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { serviceTypesApi, type CreateServiceTypeInput, type UpdateServiceTypeInput } from '../api/serviceTypesApi'

export function useServiceTypes(activeOnly = true) {
  return useQuery({
    queryKey: ['service-types', activeOnly],
    queryFn: () => serviceTypesApi.list(activeOnly),
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateServiceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateServiceTypeInput) => serviceTypesApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-types'] }),
  })
}

export function useUpdateServiceType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceTypeInput }) =>
      serviceTypesApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-types'] }),
  })
}
