import { ProfileListItem, ProfileType } from '@/types/profileType'
import { api } from '@/utils/axios'

export const getProfiles = async (): Promise<ProfileListItem[]> => {
  const { data } = await api.get<ProfileListItem[]>('/profiles')
  return data
}

export const createProfile = async (name: string): Promise<ProfileType> => {
  const { data } = await api.post<ProfileType>('/profiles', { name })
  return data
}

export const updateProfile = async (
  id: number,
  name: string
): Promise<ProfileType> => {
  const { data } = await api.put<ProfileType>(`/profiles/${id}`, { name })
  return data
}

export const deleteProfile = async (id: number): Promise<void> => {
  await api.delete(`/profiles/${id}`)
}
