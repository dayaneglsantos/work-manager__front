export interface ProfileType {
  id: number
  name: string
  fullAccess: boolean
}

export interface ProfileListItem extends ProfileType {
  userCount: number
}
