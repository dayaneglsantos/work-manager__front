import axios from 'axios'
import { getToken } from './getToken'

const apiUrl = process.env.NEXT_PUBLIC_API_URL

export const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (axios.isAxiosError(error)) {
//       const message =
//         error.response?.data?.message || 'Erro inesperado do servidor.'
//       return Promise.reject(new Error(message))
//     }
//     return Promise.reject(error)
//   }
// )
