'use client'

import AuthLayout from '@/components/AuthLayout'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import {
  confirmPasswordCreation,
  verifyPasswordCreationCode
} from '@/services/auth/passwordCreationService'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'
import { z } from 'zod'

const passwordCreationSchema = z
  .object({
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

// Define o tipo do formulário com base no esquema de validação
type PasswordCreationForm = z.infer<typeof passwordCreationSchema>

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error || 'Não foi possível concluir a solicitação.'
    )
  }

  return 'Não foi possível concluir a solicitação.'
}

export default function CreatePasswordPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')?.trim().toLowerCase() ?? ''
  const hasValidEmail = z.string().email().safeParse(email).success // Valida se o e-mail é válido
  const [step, setStep] = useState<1 | 2>(1)
  const [passwordToken, setPasswordToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors }
  } = useForm<PasswordCreationForm>({
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: ''
    },
    resolver: zodResolver(passwordCreationSchema)
  })
  const values = watch()

  const submitCurrentStep = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    // Se o passo atual for 1, valida o campo "code". Caso não seja válido, retorna sem prosseguir para o próximo passo.
    if (step === 1 && !(await trigger('code'))) return

    // Se o passo atual for 2, valida os campos "password" e "confirmPassword". Caso não sejam válidos, retorna sem prosseguir.
    if (step === 2 && !(await trigger(['password', 'confirmPassword']))) {
      return
    }

    setIsSubmitting(true)

    try {
      if (step === 1) {
        const response = await verifyPasswordCreationCode({
          email,
          code: values.code
        })
        setPasswordToken(response.passwordToken)
        setStep(2)
        toast.success(response.message)
        return
      }

      if (!passwordToken) {
        toast.error('A validação expirou. Solicite o reenvio do convite.')
        setStep(1)
        return
      }

      const response = await confirmPasswordCreation({
        passwordToken,
        newPassword: values.password,
        confirmPassword: values.confirmPassword
      })

      setSuccessMessage(response.message)
      setPasswordToken(null)
      reset()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Se o e-mail não for válido, exibe uma mensagem de erro e um link para voltar ao login
  if (!hasValidEmail) {
    return (
      <>
        <AuthLayout className="max-w-lg text-center">
          <h1 className="text-3xl font-semibold">Link de convite inválido</h1>
          <p className="mt-4 leading-6 text-gray-200">
            O link não possui um e-mail válido. Solicite um novo convite ao
            administrador.
          </p>
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

  // Se a senha foi criada com sucesso, exibe uma mensagem de sucesso e um link para voltar ao login
  if (successMessage) {
    return (
      <>
        <AuthLayout className="max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success text-2xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold">Senha criada</h1>
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
            Etapa {step} de 2
          </p>
          <div className="mx-auto mb-6 flex max-w-44 gap-2" aria-hidden="true">
            {[1, 2].map((item) => (
              <span
                key={item}
                className={`h-1 flex-1 rounded-full ${item <= step ? 'bg-primary-light' : 'bg-white/20'}`}
              />
            ))}
          </div>
          <h1 className="text-3xl font-semibold">
            {step === 1 ? 'Valide seu convite' : 'Crie sua senha'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-200">
            {step === 1
              ? `Digite o código de 6 dígitos enviado para ${email}.`
              : 'Escolha uma senha segura com pelo menos 8 caracteres.'}
          </p>
        </div>

        <form onSubmit={submitCurrentStep} className="mx-auto max-w-md">
          {step === 1 && (
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

          {step === 2 && (
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
            title={
              isSubmitting
                ? 'Aguarde...'
                : step === 1
                  ? 'Validar código'
                  : 'Criar senha'
            }
            className="mt-4 w-full font-bold"
            disabled={isSubmitting}
          />
        </form>

        <div className="mt-7 text-center text-sm">
          <p className="mb-4 text-gray-200">
            Código expirado? Solicite ao administrador o reenvio do convite.
          </p>
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
