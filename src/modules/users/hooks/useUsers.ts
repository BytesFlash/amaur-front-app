import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi, type CreateUserInput, type UpdateUserInput } from '../api/usersApi'

const KEY = 'users'
const ROLES_KEY = 'roles'

export function useUsers(params?: { page?: number; limit?: number }) {
  return useQuery({ queryKey: [KEY, params], queryFn: () => usersApi.list(params) })
}

export function useUser(id: string) {
  return useQuery({ queryKey: [KEY, id], queryFn: () => usersApi.getById(id), enabled: !!id })
}

export function useRoles() {
  return useQuery({ queryKey: [ROLES_KEY], queryFn: () => usersApi.listRoles() })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => usersApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateUserInput) => usersApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [KEY] }); qc.invalidateQueries({ queryKey: [KEY, id] }) },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useAssignRoles(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roleIds: string[]) => usersApi.assignRoles(userId, roleIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, userId] }),
  })
}

export function useChangePassword(userId: string) {
  return useMutation({
    mutationFn: (newPassword: string) => usersApi.changePassword(userId, newPassword),
  })
}
