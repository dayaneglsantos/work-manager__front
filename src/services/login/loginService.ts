import { LoginType } from '@/types/loginTypes'
import { api } from '@/utils/axios'

export const login = async ({ email, password }: LoginType) => {
  const response = await api.post('/login', { email, password })
  return response.data
}
