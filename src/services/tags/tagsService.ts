import { api } from '@/utils/axios'

export const getTags = async () => {
  try {
    const { data, status } = await api.get('/tags')
    if (status === 200) {
      return data
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
}

const createTaskTag = async (taskId: number, tagId: number) => {
  try {
    const { data, status } = await api.post(`/tasks_tags/`, { taskId, tagId })
    if (status === 201) {
      return data
    }
  } catch (error) {
    console.error('Error creating task tag:', error)
  }
}

export const createTag = async (taskId: number, name: string) => {
  try {
    const { data, status } = await api.post('/tags', { name })
    if (status === 201) {
      const response = await createTaskTag(taskId, data.id)
      console.log(response)
    }
  } catch (error) {
    console.error('Error creating tag:', error)
  }
}
