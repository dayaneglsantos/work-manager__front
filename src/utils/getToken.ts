// src/utils/getToken.ts
export async function getToken() {
  if (typeof window !== 'undefined') {
    const { getClientToken } = await import('./getClientToken')
    return getClientToken()
  } else {
    const { getServerToken } = await import('./getServerToken')
    return getServerToken()
  }
}
