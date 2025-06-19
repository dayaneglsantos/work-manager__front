'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

import { ReactNode, useEffect } from 'react'

export const ProtectRoute = ({ children }: { children: ReactNode }) => {
  const { session, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.push('/login')
    }
  }, [session, router, loading])

  if (!session) {
    return null
  }

  return <>{children}</>
}
