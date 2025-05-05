'use client'
import Button from '@/components/Button'
import InputField from '@/components/InputField'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as zod from 'zod'

interface ForgotPasswordProps {
  step: number
  setStep: (step: number) => void
}

export default function ForgotPassword({ step, setStep }: ForgotPasswordProps) {
  const defaultValues = {
    email: '',
    code: '',
    password: '',
    confirmPassword: ''
  }

  const forgotPasswordSchema = zod
    .object({
      email: zod.string().min(1, 'Campo obrigatório').email('E-mail inválido'),
      code: zod.string().length(6, 'Código deve ter 6 dígitos'),
      password: zod.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
      confirmPassword: zod
        .string()
        .min(6, 'Senha deve ter pelo menos 6 caracteres')
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'As senhas não coincidem',
      path: ['confirmPassword']
    })

  const methods = useForm({
    defaultValues,
    mode: 'onSubmit',
    resolver: zodResolver(forgotPasswordSchema)
  })

  const {
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    clearErrors,
    formState: { errors }
  } = methods

  const onSubmit = async () => {
    if (step === 1) {
      const isValid = await trigger('email')
      if (isValid) setStep(2)
    } else if (step === 2) {
      const isValid = await trigger('code')
      if (isValid) setStep(3)
    } else {
      const isValid = (await trigger('password')) && trigger('confirmPassword')
      if (isValid) {
        console.log('Submit')
        reset()
        setStep(1)
      }
    }
  }

  const formValues = watch()

  useEffect(() => {
    if (step === 1) {
      reset()
    }
  }, [step, reset])

  useEffect(() => {
    clearErrors()
  }, [step, clearErrors])

  return (
    <>
      <form
        className="flex flex-col justify-center items-center h-full w-full sm:w-4/5 ms:w-3/5 mx-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        {step === 1 && (
          <>
            <p className="mb-4">
              Informe seu e-mail para para envio do código de validação
            </p>
            <InputField
              type="email"
              placeholder="E-mail"
              value={formValues.email}
              onChange={(e) => setValue('email', e.target.value)}
              error={errors.email?.message}
            />

            <Button title="Enviar código" onClick={onSubmit} />
          </>
        )}
        {step === 2 && (
          <>
            <p className="mb-4">Informe o código de validação</p>
            <InputField
              type="text"
              placeholder="Código"
              value={formValues.code}
              onChange={(e) => setValue('code', e.target.value)}
              error={errors.code?.message}
            />
            <Button title="Enviar código" onClick={onSubmit} />
          </>
        )}
        {step === 3 && (
          <>
            <p className="mb-4">Informe a nova senha</p>
            <InputField
              type="password"
              placeholder="Senha"
              value={formValues.password}
              onChange={(e) => setValue('password', e.target.value)}
              error={errors.password?.message}
            />
            <InputField
              type="password"
              placeholder="Repita a senha"
              value={formValues.confirmPassword}
              onChange={(e) => setValue('confirmPassword', e.target.value)}
              error={errors.confirmPassword?.message}
            />
            <Button title="Salvar nova senha" onClick={onSubmit} />
          </>
        )}
      </form>
    </>
  )
}
