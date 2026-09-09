import { api } from '@/utils/axios'
import toast from 'react-hot-toast'
import { DepartmentDetails, DepartmentType } from '@/types/departmentType'
import { UserOptionsResponse } from '@/types/userType'

// A listagem administrativa trata erros na própria página. O serviço legado
// permanece disponível para os formulários de usuários que já o consomem.
export const listDepartments = async (): Promise<DepartmentDetails[]> => {
  const { data } = await api.get<DepartmentDetails[]>('/departments')
  return data
}

export const getDepartment = async (id: number): Promise<DepartmentDetails> => {
  const { data } = await api.get<DepartmentDetails>(`/departments/${id}`)
  return data
}

export const updateDepartment = async (
  id: number,
  payload: { name: string; managerId: number }
) => {
  const { data } = await api.patch<DepartmentType>(
    `/departments/${id}`,
    payload
  )
  return data
}

export const createDepartment = async (payload: {
  name: string
  managerId: number
}) => {
  const { data } = await api.post<DepartmentType>('/departments', payload)
  return data
}

export const deleteDepartment = async (id: number) => {
  await api.delete(`/departments/${id}`)
}

export const listDepartmentManagers = async (search: string, page: number) => {
  const { data } = await api.get<UserOptionsResponse>('/users/options', {
    params: { employmentStatus: 'active', search, page, pageSize: 20 }
  })
  return data
}

export const getDepartments = async () => {
  try {
    const { data, status } = await api.get('/departments')
    if (status !== 200) {
      toast.error('Erro ao buscar departamentos')
    } else {
      return data
    }
  } catch (error) {
    console.error(error)
    toast.error('Erro ao buscar departamentos')
  }
}
