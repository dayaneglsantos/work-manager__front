import { api } from '@/utils/axios'
import toast from 'react-hot-toast'

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
