'use client'

import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import { useAuth } from '@/contexts/AuthContext'
import { login } from '@/services/auth/loginService'
import { LoginType } from '@/types/loginType'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'
import { z } from 'zod'

export default function Login() {
  const [invalidCredentials, setInvalidCredentials] = useState(false)
  const router = useRouter()
  const { saveSession, session, loading, clearLocalSession } = useAuth()
  const checkedStoredSession = useRef(false)

  useEffect(() => {
    if (loading || checkedStoredSession.current) return

    checkedStoredSession.current = true
    if (session) {
      clearLocalSession()
    }
  }, [session, loading, clearLocalSession])

  const loginSchema = z.object({
    email: z.string().email('E-mail inválido').min(1, 'Campo obrigatório'),
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres')
  })

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<LoginType>({
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
    resolver: zodResolver(loginSchema)
  })

  const formValues = watch()

  const onSubmit = async (values: LoginType) => {
    const loadingToast = toast.loading('Entrando...')

    try {
      setInvalidCredentials(false)
      const data = await login(values)
      if (data) {
        toast.success('Login realizado com sucesso.', { id: loadingToast })
        saveSession(data)
        router.push('/')
      } else {
        toast.dismiss(loadingToast)
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setInvalidCredentials(true)
      }

      toast.error(error?.response?.data?.error || 'Erro ao fazer login.', {
        id: loadingToast
      })
    }
  }

  return (
    <>
      <AuthLayout className="max-w-xl text-center">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <h1 className="mb-6 text-3xl">Faça login na plataforma</h1>
          <div className="mx-auto mb-3 flex max-w-md flex-col justify-center p-3 text-black">
            <InputField
              type="text"
              placeholder="E-mail"
              value={formValues.email}
              onChange={(event) => {
                setInvalidCredentials(false)
                setValue('email', event.target.value)
              }}
              error={errors.email?.message}
              invalid={invalidCredentials}
              forceLightAppearance
            />
            <InputField
              type="password"
              placeholder="Senha"
              value={formValues.password}
              onChange={(event) => {
                setInvalidCredentials(false)
                setValue('password', event.target.value)
              }}
              error={errors.password?.message}
              invalid={invalidCredentials}
              forceLightAppearance
            />
            <Button
              title={isSubmitting ? 'Entrando...' : 'Entrar'}
              disabled={isSubmitting}
              className="mt-4 w-52 self-center font-bold"
            />
          </div>
          <Link
            href="/recuperar-senha"
            className="underline decoration-white/60 underline-offset-4 transition-colors hover:text-primary-light"
          >
            Esqueci a senha
          </Link>
        </form>
      </AuthLayout>
      <Toaster />
    </>
  )
}
