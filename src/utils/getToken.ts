import { getClientToken } from './getClientToken'
import { getServerToken } from './getServerToken'

// src/utils/getToken.ts
export async function getToken() {
  if (typeof window !== 'undefined') {
    return getClientToken()
  } else {
    return getServerToken()
  }
}
