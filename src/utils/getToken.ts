export const getToken = () => {
  const session = JSON.parse(localStorage.getItem('session') || '{}')
  if (session) {
    return session.token
  }
}
