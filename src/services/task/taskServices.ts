import { TasksMetaType, TaskType } from '@/types/taskType'
import { api } from '@/utils/axios'

export interface getTasksParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
}

interface GetTasksResponse {
  data: TaskType[]
  meta: TasksMetaType
}

export const getTasks = async ({
  page = 1,
  status = '',
  search = '',
  pageSize = 10
}: getTasksParams = {}): Promise<GetTasksResponse> => {
  const params = {
    page,
    pageSize,
    ...(status && { status }),
    ...(search && { search })
  }

  const response = await api.get(`/tasks`, {
    params: {
      ...params
    }
  })
  return response.data
}

export const updateTask = async (
  taskId: number,
  updatedData: Partial<TaskType>
) => {
  const response = await api.put(`/tasks/${taskId}`, updatedData)
  return response.data
}
