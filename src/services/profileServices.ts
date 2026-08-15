import { ProfileType } from '@/types/profileType'
import { api } from '@/utils/axios'

export const getProfiles = async (): Promise<ProfileType[]> => {
  const { data } = await api.get<ProfileType[]>('/profiles')
  return data
}
