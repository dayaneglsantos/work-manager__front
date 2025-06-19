'use client'
import InputField from '@/components/InputField'
import bgImage from '@/assets/images/login-bg.jpg' // Adjust the path as necessary
import Button from '@/components/Button'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import Modal from '@/components/Modal'

import ForgotPassword from '@/screens/ForgotPassword'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { login } from '@/services/login/loginService'
import toast, { Toaster } from 'react-hot-toast'
import { LoginType } from '@/types/loginTypes'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Login() {
  const [open, setOpen] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1)
  const router = useRouter()
  const { saveSession, session, loading } = useAuth()

  useEffect(() => {
    if (!loading && session) {
      router.push('/')
    }
  }, [session, loading, router])

  const loginSchema = z.object({
    email: z.string().email('Email inválido').min(1, 'Campo obrigatório'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
  })

  const defaultValues = {
    email: '',
    password: ''
  }

  const methods = useForm({
    defaultValues,
    mode: 'onBlur',
    resolver: zodResolver(loginSchema)
  })

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = methods

  const formValues = watch()

  const onSubmit = async (values: LoginType) => {
    try {
      const data = await login(values)
      if (data) {
        toast.success('Login realizado com sucesso!')
        saveSession(data)
        router.push('/')
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || 'Erro ao fazer login.'
      toast.error(errorMessage)
    }
  }

  return (
    <>
      <div
        className={`relative h-screen w-screen  flex items-center justify-center`}
      >
        <Image
          src={bgImage}
          alt="Background"
          fill
          priority
          quality={100}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black opacity-80"></div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative z-10 text-white text-center w-full"
        >
          <h1 className="mb-6 text-3xl">Faça login na plataforma</h1>
          <div className="flex flex-col mx-auto md:w-md mb-3 p-3">
            <InputField
              type="email"
              placeholder="E-mail"
              value={formValues.email}
              onChange={(e) => setValue('email', e.target.value)}
              error={errors?.email?.message}
            />
            <InputField
              type="password"
              placeholder="Senha"
              value={formValues.password}
              onChange={(e) => setValue('password', e.target.value)}
              error={errors?.password?.message}
            />
            <Button title="Entrar" />
          </div>
          <span
            className="underline cursor-pointer"
            onClick={() => setOpen(true)}
          >
            Esqueci a senha
          </span>
        </form>
      </div>
      <Toaster />
      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
          setForgotPasswordStep(1)
        }}
      >
        <ForgotPassword
          step={forgotPasswordStep}
          setStep={setForgotPasswordStep}
        />
      </Modal>
    </>
  )
}
