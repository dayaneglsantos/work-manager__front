'use client'

import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordResetCode
} from '@/services/auth/passwordResetService'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'
import { z } from 'zod'

const RESEND_INTERVAL_SECONDS = 60

const recoverySchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Campo obrigatório')
      .email('E-mail inválido'),
    code: z.string().regex(/^\d{6}$/, 'O código deve ter 6 dígitos'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  })

type RecoveryForm = z.infer<typeof recoverySchema>
type RecoveryStep = 1 | 2 | 3

const stepContent = {
  1: {
    title: 'Recuperar sua senha',
    description:
      'Informe o e-mail associado à sua conta para receber o código de validação.',
    button: 'Enviar código'
  },
  2: {
    title: 'Verifique seu e-mail',
    description:
      'Digite abaixo o código de 6 dígitos enviado para o seu e-mail.',
    button: 'Validar código'
  },
  3: {
    title: 'Crie uma nova senha',
    description: 'Escolha uma senha segura com pelo menos 8 caracteres.',
    button: 'Redefinir senha'
  }
} as const

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error || 'Não foi possível concluir a solicitação.'
    )
  }

  return 'Não foi possível concluir a solicitação.'
}

export default function RecoverPasswordPage() {
  const [step, setStep] = useState<RecoveryStep>(1)
  const [resetToken, setResetToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const content = stepContent[step]
  const {
    setValue,
    watch,
    trigger,
    reset,
    clearErrors,
    formState: { errors }
  } = useForm<RecoveryForm>({
    defaultValues: {
      email: '',
      code: '',
      password: '',
      confirmPassword: ''
    },
    resolver: zodResolver(recoverySchema)
  })

  const values = watch()

  useEffect(() => {
    if (resendCountdown <= 0) return

    const timer = window.setInterval(() => {
      setResendCountdown((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendCountdown])

  useEffect(() => {
    clearErrors()
  }, [step, clearErrors])

  const sendCode = async () => {
    const response = await requestPasswordReset({
      email: values.email.trim().toLowerCase()
    })

    setValue('email', values.email.trim().toLowerCase())
    setValue('code', '')
    setResetToken(null)
    setResendCountdown(RESEND_INTERVAL_SECONDS)
    toast.success(response.message)
  }

  const submitCurrentStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    if (step === 1 && !(await trigger('email'))) return
    if (step === 2 && !(await trigger('code'))) return
    if (step === 3 && !(await trigger(['password', 'confirmPassword']))) {
      return
    }

    setIsSubmitting(true)

    try {
      if (step === 1) {
        await sendCode()
        setStep(2)
        return
      }

      if (step === 2) {
        const response = await verifyPasswordResetCode({
          email: values.email,
          code: values.code
        })
        setResetToken(response.resetToken)
        setStep(3)
        toast.success(response.message)
        return
      }

      if (!resetToken) {
        toast.error('A validação expirou. Solicite um novo código.')
        setStep(1)
        return
      }

      const response = await confirmPasswordReset({
        resetToken,
        newPassword: values.password,
        confirmPassword: values.confirmPassword
      })

      setSuccessMessage(response.message)
      setResetToken(null)
      setResendCountdown(0)
      reset()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const resendCode = async () => {
    if (isSubmitting || resendCountdown > 0) return

    setIsSubmitting(true)
    try {
      await sendCode()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const changeEmail = () => {
    setValue('code', '')
    setResetToken(null)
    setResendCountdown(0)
    setStep(1)
  }

  if (successMessage) {
    return (
      <>
        <AuthLayout className="max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success text-2xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold">Senha redefinida</h1>
          <p className="mt-4 leading-6 text-gray-200">{successMessage}</p>
          <Link
            href="/login"
            className="mt-7 inline-block w-full rounded-full bg-primary p-2 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
          >
            Ir para o login
          </Link>
        </AuthLayout>
        <Toaster />
      </>
    )
  }

  return (
    <>
      <AuthLayout className="max-w-lg">
        <div className="mb-7 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-light">
            Etapa {step} de 3
          </p>
          <div className="mx-auto mb-6 flex max-w-44 gap-2" aria-hidden="true">
            {[1, 2, 3].map((item) => (
              <span
                key={item}
                className={`h-1 flex-1 rounded-full ${item <= step ? 'bg-primary-light' : 'bg-white/20'}`}
              />
            ))}
          </div>
          <h1 className="text-3xl font-semibold">{content.title}</h1>
          <p className="mt-3 text-sm leading-6 text-gray-200">
            {content.description}
          </p>
        </div>

        <form onSubmit={submitCurrentStep} className="mx-auto max-w-md">
          {step === 1 && (
            <InputField
              type="text"
              placeholder="E-mail"
              value={values.email}
              onChange={(event) => setValue('email', event.target.value)}
              error={errors.email?.message}
              forceLightAppearance
            />
          )}

          {step === 2 && (
            <InputField
              type="text"
              placeholder="Código de 6 dígitos"
              value={values.code}
              onChange={(event) =>
                setValue(
                  'code',
                  event.target.value.replace(/\D/g, '').slice(0, 6)
                )
              }
              error={errors.code?.message}
              forceLightAppearance
            />
          )}

          {step === 3 && (
            <>
              <InputField
                type="password"
                placeholder="Nova senha"
                value={values.password}
                onChange={(event) => setValue('password', event.target.value)}
                error={errors.password?.message}
                forceLightAppearance
              />
              <InputField
                type="password"
                placeholder="Confirme a nova senha"
                value={values.confirmPassword}
                onChange={(event) =>
                  setValue('confirmPassword', event.target.value)
                }
                error={errors.confirmPassword?.message}
                forceLightAppearance
              />
            </>
          )}

          <Button
            title={isSubmitting ? 'Aguarde...' : content.button}
            className="mt-4 w-full font-bold"
            disabled={isSubmitting}
          />
        </form>

        <div className="mt-7 text-center text-sm">
          {step === 2 && (
            <>
              <button
                type="button"
                onClick={resendCode}
                disabled={isSubmitting || resendCountdown > 0}
                className="mb-4 block w-full text-gray-200 underline decoration-white/50 underline-offset-4 enabled:cursor-pointer enabled:hover:text-white disabled:opacity-60"
              >
                {resendCountdown > 0
                  ? `Reenviar código em ${resendCountdown}s`
                  : 'Reenviar código'}
              </button>
              <button
                type="button"
                onClick={changeEmail}
                disabled={isSubmitting}
                className="mb-4 block w-full cursor-pointer text-gray-200 underline decoration-white/50 underline-offset-4 hover:text-white disabled:cursor-default disabled:opacity-60"
              >
                Alterar e-mail
              </button>
            </>
          )}
          <Link
            href="/login"
            className="text-gray-200 underline decoration-white/50 underline-offset-4 transition-colors hover:text-white"
          >
            Voltar para o login
          </Link>
        </div>
      </AuthLayout>
      <Toaster />
    </>
  )
}
