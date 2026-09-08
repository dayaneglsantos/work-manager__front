export interface DepartmentType {
  id: number
  name: string
  managerId?: number
}

export interface DepartmentDetails extends DepartmentType {
  managerId: number
  manager: {
    id: number
    name: string
    profileImage: string | null
    employmentStatus: 'active' | 'inactive' | 'terminated' | 'resigned'
  }
  _count: { users: number }
}
