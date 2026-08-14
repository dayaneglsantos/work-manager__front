import axios from 'axios'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL não está configurada.')
}

const publicAuthEndpoints = [
  '/login',
  '/logout',
  '/password-reset/request',
  '/password-reset/verify',
  '/password-reset/confirm'
]

let isRedirectingToLogin = false

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

api.interceptors.response.use(
  (response) => {
    // Se a resposta for sucesso, apenas retorna a resposta
    return response
  },
  (error) => {
    const requestPath = error.config?.url?.split('?')[0] ?? ''
    const isPublicAuthRequest = publicAuthEndpoints.includes(requestPath)

    // Se o erro for 401 (Unauthorized)
    if (error.response?.status === 401 && !isPublicAuthRequest) {
      // Só executa no lado do cliente
      if (typeof window !== 'undefined') {
        // Limpa o localStorage e redireciona para o login
        localStorage.removeItem('session')

        if (!isRedirectingToLogin && window.location.pathname !== '/login') {
          isRedirectingToLogin = true
          window.location.replace('/login')
        }
      }
    }
    // Retorna a promessa rejeitada para que outros `catch` possam tratar outros erros
    return Promise.reject(error)
  }
)
