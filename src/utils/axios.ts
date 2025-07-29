import axios from 'axios'
import { getToken } from './getToken'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

api.interceptors.request.use(async (config) => {
  const token = await getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    // Se a resposta for sucesso, apenas retorna a resposta
    return response
  },
  (error) => {
    // Se o erro for 401 (Unauthorized)
    if (error.response?.status === 401) {
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
