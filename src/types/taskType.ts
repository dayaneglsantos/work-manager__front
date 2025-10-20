export interface TagType {
  id: number
  name: string
}

export interface TaskType {
  id: number
  title: string
  description: string
  status: 'todo' | 'inProgress' | 'paused' | 'done'
  deadline: string
  departmentId: null
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  assignee: {
    id: number
    name: string
    email: string
    profileImage: string
  }
  department: {
    id: number
    name: string
    managerId: number
  }
  creator: {
    id: number
    name: string
    email: string
    profileImage: string
  }
  blocking: TaskType | null
  subtasks: TaskType[]
  parentTask: TaskType | null
  tags: TagType[]
}

export interface TasksMetaType {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}
