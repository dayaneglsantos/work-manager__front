import { DepartmentType } from './departmentType'

export interface UserType {
  id: number
  name: string
  email: string
  phoneNumber?: string
  birthDate?: string
  profileImage?: string
  currentSalary?: number
  admissionDate?: string
  currentPosition?: string
  employmentStatus?: 'active' | 'terminated' | 'resigned' | 'onLeave'
  notes?: string
  address?: {
    zipCode: string
    state: string
    city: string
    street: string
    number: number
    complement: string
  }
  profile: {
    id: number
    name: string
  }
  supervisor?: {
    id: number
    name: string
  }
  department: DepartmentType
}
