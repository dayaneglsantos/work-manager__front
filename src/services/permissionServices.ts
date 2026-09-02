import {
  ProfilePermissionList,
  UserPermissionList
} from '@/types/permissionType'
import { api } from '@/utils/axios'

export const getProfilePermissions = async (
  profileId: number
): Promise<ProfilePermissionList> => {
  const { data } = await api.get<ProfilePermissionList>(
    `/profiles/${profileId}/permissions`
  )
  return data
}

export const updateProfilePermissions = async (
  profileId: number,
  permissions: Array<{ permissionId: number; hasPermission: boolean }>
): Promise<ProfilePermissionList> => {
  const { data } = await api.put<ProfilePermissionList>(
    `/profiles/${profileId}/permissions`,
    { permissions }
  )
  return data
}

export const getUserPermissions = async (
  userId: number
): Promise<UserPermissionList> => {
  const { data } = await api.get<UserPermissionList>(
    `/users/${userId}/permissions`
  )
  return data
}

export const updateUserPermissions = async (
  userId: number,
  permissions: Array<{
    permissionId: number
    customValue: boolean | null
  }>
): Promise<UserPermissionList> => {
  const { data } = await api.put<UserPermissionList>(
    `/users/${userId}/permissions`,
    { permissions }
  )
  return data
}
