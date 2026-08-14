'use client'

import { SessionType } from '@/types/sessionType'
import { api } from '@/utils/axios'
import { useRouter } from 'next/navigation'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState
} from 'react'

type AuthContextType = {
  session: SessionType | null
  loading: boolean
  isLoggingOut: boolean
  saveSession: (newSession: SessionType) => void
  clearSession: () => Promise<void>
  clearLocalSession: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<SessionType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const loggingOutRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    const storedSession = localStorage.getItem('session')
    if (storedSession) {
      setSession(JSON.parse(storedSession))
    }
    setLoading(false)
  }, [])

  const saveSession = (newSession: SessionType) => {
    localStorage.setItem('session', JSON.stringify(newSession))
    setSession(newSession)
  }

  const clearLocalSession = useCallback(() => {
    localStorage.removeItem('session')
    setSession(null)
  }, [])

  const clearSession = async () => {
    if (loggingOutRef.current) return

    loggingOutRef.current = true
    setIsLoggingOut(true)

    try {
      await api.post('/logout')
    } catch {
      // A falha da API não deve impedir o logout local.
    } finally {
      clearLocalSession()
      router.push('/login')
      loggingOutRef.current = false
      setIsLoggingOut(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        saveSession,
        clearSession,
        clearLocalSession,
        loading,
        isLoggingOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
