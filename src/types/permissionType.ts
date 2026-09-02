export interface PermissionBase {
  permissionId: number
  name: string
  type: string
  action: string
}

export interface ProfilePermission extends PermissionBase {
  hasPermission: boolean
}

export interface UserPermission extends PermissionBase {
  profileValue: boolean
  customValue: boolean | null
  effectiveValue: boolean
}

export interface ProfilePermissionList {
  profile: {
    id: number
    name: string
  }
  permissions: ProfilePermission[]
}

export interface UserPermissionList {
  user: {
    id: number
    name: string
    profile: {
      id: number
      name: string
    }
  }
  permissions: UserPermission[]
}
