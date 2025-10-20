import { api } from '@/utils/axios'
import toast from 'react-hot-toast'

interface getUsersParams {
  page?: number
  pageSize?: number
  departmentId?: number
  search?: string
}

export const getUsers = async ({
  page,
  pageSize,
  departmentId,
  search = ''
}: getUsersParams = {}) => {
  const params = {
    page,
    pageSize,
    ...(page && { page }),
    ...(pageSize && { pageSize }),
    ...(departmentId && { departmentId }),
    ...(search && { search })
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
