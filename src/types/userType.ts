import { DepartmentType } from './departmentType'

export type EmploymentStatus = 'active' | 'inactive' | 'terminated' | 'resigned'

export interface UsersMetaType {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface UsersResponse {
  data: UserType[]
  meta: UsersMetaType
}

export interface AddressType {
  zipCode: string
  state: string
  city: string
  street: string
  number: number
  complement?: string | null
}

export interface UserPayload {
  name: string
  email: string
  cpf: string
  phoneNumber: string
  birthDate?: string
  profileId: number
  departmentId?: number | null
  currentSalary: number
  admissionDate: string
  currentPosition: string
  employmentStatus: EmploymentStatus
  statusReason?: string | null
  notes?: string
  address?: AddressType
}

export type CreateUserPayload = UserPayload

export type UpdateUserPayload = Partial<UserPayload>

export interface CreateUserResponse {
  id: number
  invitationSent: boolean
}

export interface ProfileImageUploadSignature {
  apiKey: string
  cloudName: string
  signature: string
  timestamp: number
  uploadPreset: string
}

export interface CloudinaryProfileImageUploadResponse {
  bytes: number
  format: string
  public_id: string
  resource_type: 'image'
  signature: string
  version: number
}

export interface ProfileImageResponse {
  id: number
  profileImage: string | null
}

export interface ProfileImageChange {
  file: File | null
  removeCurrentImage: boolean
}

export interface UserType {
  id: number
  hasPassword: boolean
  isSystemOwner?: boolean
  name: string
  email: string
  cpf?: string
  phoneNumber?: string
  birthDate?: string
  profileImage?: string
  currentSalary?: number
  admissionDate?: string
  currentPosition?: string
  employmentStatus: EmploymentStatus
  statusReason?: string | null
  notes?: string
  address?: AddressType
  profile: {
    id: number
    name: string
    fullAccess: boolean
  }
  department?: DepartmentType | null
}
