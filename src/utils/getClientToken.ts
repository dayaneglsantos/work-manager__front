export const getClientToken = () => {
  if (typeof window === 'undefined') return null // evita erro no servidor
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  if (session) {
    return session.token
  }
}
