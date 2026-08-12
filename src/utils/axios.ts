import axios from 'axios'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

if (!apiUrl) {
  throw new Error('NEXT_PUBLIC_API_URL não está configurada.')
}

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
    const isLoginRequest = error.config?.url === '/login'

    // Se o erro for 401 (Unauthorized)
    if (error.response?.status === 401 && !isLoginRequest) {
      // Só executa no lado do cliente
      if (typeof window !== 'undefined') {
        // Limpa o localStorage e redireciona para o login
        localStorage.removeItem('session') // ou a sua chave do local storage
        window.location.href = '/login'
      }
    }
    // Retorna a promessa rejeitada para que outros `catch` possam tratar outros erros
    return Promise.reject(error)
  }
)
