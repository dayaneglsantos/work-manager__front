import { PermissionsType } from './rolesType'

export interface SessionType {
  id: number
  name: string
  profileImage: string | null
  profile: {
    id: number
    name: string
  }
  permissions: PermissionsType[]
}
