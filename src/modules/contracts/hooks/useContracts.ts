import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractsApi, type CreateContractInput } from '../api/contractsApi'

const KEY = 'contracts'

export function useContracts(params?: Parameters<typeof contractsApi.list>[0]) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => contractsApi.list(params) })
}

export function useContract(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => contractsApi.getById(id), enabled: !!id })
}

export function useContractServices(id: string) {
  return useQuery({ queryKey: [KEY, id, 'services'], queryFn: () => contractsApi.listServices(id), enabled: !!id })
}

export function useCreateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateContractInput) => contractsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateContract(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CreateContractInput>) => contractsApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => contractsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
