import { api } from '@/utils/axios'
import {
  CloudinaryProfileImageUploadResponse,
  CreateUserPayload,
  CreateUserResponse,
  EmploymentStatus,
  ProfileImageResponse,
  ProfileImageUploadSignature,
  UpdateUserPayload,
  UserType,
  UsersResponse
} from '@/types/userType'
import axios from 'axios'
import toast from 'react-hot-toast'

interface GetUsersParams {
  page?: number
  pageSize?: number
  departmentId?: number
  search?: string
  employmentStatus?: EmploymentStatus
}

export const getUsers = async ({
  page,
  pageSize,
  departmentId,
  search = '',
  employmentStatus
}: GetUsersParams = {}): Promise<UsersResponse | undefined> => {
  const params = {
    ...(page && { page }),
    ...(pageSize && { pageSize }),
    ...(departmentId && { departmentId }),
    ...(search && { search }),
    ...(employmentStatus && { employmentStatus })
  }

  try {
    const { data, status } = await api.get('/users', { params })
    if (status !== 200) {
      toast.error('Erro ao buscar usuários')
    } else {
      return data
    }
  } catch (error) {
    console.error(error)
    toast.error('Erro ao buscar usuários')
  }
}

export const getUserById = async (id: number): Promise<UserType> => {
  const { data } = await api.get<UserType>(`/users/${id}`)
  return data
}

export const createUser = async (
  payload: CreateUserPayload
): Promise<CreateUserResponse> => {
  const { data } = await api.post<CreateUserResponse>('/users', payload)
  return data
}

export const updateUser = async (
  id: number,
  payload: UpdateUserPayload
): Promise<UserType> => {
  const { data } = await api.patch<UserType>(`/users/${id}`, payload)
  return data
}

export const resendPasswordInvitation = async (
  id: number
): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>(
    `/users/${id}/password-invitation/resend`
  )
  return data
}

export const uploadProfileImage = async (
  userId: number,
  file: File
): Promise<ProfileImageResponse> => {
  const { data: uploadSignature } =
    await api.post<ProfileImageUploadSignature>(
      `/users/${userId}/profile-image/signature`
    )

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', uploadSignature.apiKey)
  formData.append('timestamp', String(uploadSignature.timestamp))
  formData.append('upload_preset', uploadSignature.uploadPreset)
  formData.append('signature', uploadSignature.signature)

  const { data: uploadedImage } =
    await axios.post<CloudinaryProfileImageUploadResponse>(
      `https://api.cloudinary.com/v1_1/${uploadSignature.cloudName}/image/upload`,
      formData
    )

  const { data } = await api.put<ProfileImageResponse>(
    `/users/${userId}/profile-image`,
    {
      bytes: uploadedImage.bytes,
      format: uploadedImage.format,
      publicId: uploadedImage.public_id,
      resourceType: uploadedImage.resource_type,
      signature: uploadedImage.signature,
      version: uploadedImage.version
    }
  )

  return data
}

export const removeProfileImage = async (
  userId: number
): Promise<ProfileImageResponse> => {
  const { data } = await api.delete<ProfileImageResponse>(
    `/users/${userId}/profile-image`
  )

  return data
}
