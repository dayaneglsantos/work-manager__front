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
  page = 1,
  status = '',
  search = '',
  pageSize = 10
}: getTasksParams = {}) => {
  const params = {
    page,
    pageSize,
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

export const updateTask = async (
  taskId: number,
  updatedData: Partial<TaskType>
) => {
  try {
    const { status } = await api.put(`/tasks/${taskId}`, updatedData)
    if (status === 200) {
      toast.success('Tarefa atualizada com sucesso!')
    } else {
      toast.error('Erro ao atualizar tarefa')
    }
  } catch (error) {
    console.error(error)
    toast.error('Erro ao atualizar tarefa')
  }
}
