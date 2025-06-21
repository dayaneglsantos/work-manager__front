export interface SelectOptions {
  label: string
  value: string
}

export interface FilterListType {
  type: string
  name: string
  placeholder: string
  options?: SelectOptions[]
  width?: number
  height?: number
  multiple?: boolean
  style?: string
}
