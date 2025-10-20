import { TaskType } from '@/types/taskType'
import { api } from '@/utils/axios'
import toast from 'react-hot-toast'

export interface getTasksParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

export const getTasks = async ({
  page,
  pageSize,
  status = '',
  search = ''
}: getTasksParams = {}) => {
  const params = {
    page,
    pageSize,
    ...(page && { page }),
    ...(pageSize && { pageSize }),
    ...(status && { status }),
    ...(search && { search })
  }

  try {
    const { data, status } = await api.get('/tasks', { params })
    if (status !== 200) {
      toast.error('Erro ao buscar tarefas')
    } else {
      return data
    }
  } catch (error) {
    console.error(error)
    toast.error('Erro ao buscar tarefas')
  }
}

const getTask = async (taskId: number) => {
  try {
    const { data, status } = await api.get(`/tasks/${taskId}`)
    if (status === 200) {
      return data
    }
  } catch (error) {
    console.error('Error fetching task:', error)
  }
}

export const updateTask = async (
  taskId: number,
  updatedData: Partial<TaskType>
) => {
  try {
    const { status } = await api.put(`/tasks/${taskId}`, updatedData)
    if (status === 201) {
      toast.success('Tarefa atualizada com sucesso!')
    } else {
      toast.error('Erro ao atualizar tarefa')
    }
  } catch (error) {
    console.error(error)
    toast.error('Erro ao atualizar tarefa')
  }
}
