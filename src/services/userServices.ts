import { api } from '@/utils/axios'
import {
  CreateUserPayload,
  EmploymentStatus,
  UpdateUserPayload,
  UserType,
  UsersResponse
} from '@/types/userType'
import toast from 'react-hot-toast'

interface GetUsersParams {
  page?: number
  pageSize?: number
  departmentId?: number
  search?: string
  employmentStatus?: EmploymentStatus
}

export const getUsers = async ({
  page,
  pageSize,
  departmentId,
  search = '',
  employmentStatus
}: GetUsersParams = {}): Promise<UsersResponse | undefined> => {
  const params = {
    ...(page && { page }),
    ...(pageSize && { pageSize }),
    ...(departmentId && { departmentId }),
    ...(search && { search }),
    ...(employmentStatus && { employmentStatus })
  }

  try {
    const { data, status } = await api.get('/users', { params })
    if (status !== 200) {
      toast.error('Erro ao buscar usuários')
    } else {
      return data
    }
  } catch (error) {
    console.error(error)
    toast.error('Erro ao buscar usuários')
  }
}

export const getUserById = async (id: number): Promise<UserType> => {
  const { data } = await api.get<UserType>(`/users/${id}`)
  return data
}

export const createUser = async (
  payload: CreateUserPayload
): Promise<{ id: number }> => {
  const { data } = await api.post<{ id: number }>('/users', payload)
  return data
}

export const updateUser = async (
  id: number,
  payload: UpdateUserPayload
): Promise<UserType> => {
  const { data } = await api.patch<UserType>(`/users/${id}`, payload)
  return data
}
