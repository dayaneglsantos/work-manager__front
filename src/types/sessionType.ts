import { PermissionsType } from './rolesType'

export interface SessionType {
  id: string
  birthdate: Date
  email: string
  cpf: string
  name: string
  employment_status: string
  supervisor_id: number
  profile_id: number
  token: string
  last_access: Date
  profile_img: string
  permissions: PermissionsType[]
}
