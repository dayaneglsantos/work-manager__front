'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getDepartments } from '@/services/departmentServices'
import { getProfiles } from '@/services/profileServices'
import { getUsers } from '@/services/userServices'
import {
  CreateUserPayload,
  UpdateUserPayload,
  UserPayload,
  UserType
} from '@/types/userType'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from './Button'
import Checkbox from './Checkbox'
import FormField from './FormField'
import FormSelectField from './FormSelectField'
import TextareaField from './TextareaField'

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (value) => !value || z.string().url().safeParse(value).success,
    'Informe uma URL válida'
  )

const baseUserFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  email: z.string().trim().email('Informe um e-mail válido'),
  phoneNumber: z.string().trim().min(1, 'Informe o telefone'),
  birthDate: z.string(),
  profileImage: optionalUrl,
  profileId: z.number({ invalid_type_error: 'Selecione um perfil' }).min(1),
  supervisorId: z.number().nullable(),
  departmentId: z.number().nullable(),
  currentSalary: z
    .number({ invalid_type_error: 'Informe o salário atual' })
    .nonnegative('O salário não pode ser negativo'),
  admissionDate: z.string().min(1, 'Informe a data de admissão'),
  currentPosition: z.string().trim().min(1, 'Informe o cargo'),
  employmentStatus: z.enum([
    'active',
    'inactive',
    'terminated',
    'resigned'
  ]),
  statusReason: z.string(),
  notes: z.string(),
  password: z.string(),
  includeAddress: z.boolean(),
  address: z.object({
    zipCode: z.string(),
    state: z.string(),
    city: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string()
  })
})

const createUserFormSchema = (mode: 'create' | 'edit') =>
  baseUserFormSchema.superRefine((values, context) => {
    if (mode === 'create' && !values.password.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe uma senha',
        path: ['password']
      })
    }

    if (values.employmentStatus === 'inactive' && !values.statusReason.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Informe o motivo da inativação',
        path: ['statusReason']
      })
    }

    if (values.includeAddress) {
      const requiredAddressFields = [
        ['zipCode', 'Informe o CEP'],
        ['state', 'Informe o estado'],
        ['city', 'Informe a cidade'],
        ['street', 'Informe a rua'],
        ['number', 'Informe o número']
      ] as const

      requiredAddressFields.forEach(([field, message]) => {
        if (!values.address[field].trim()) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message,
            path: ['address', field]
          })
        }
      })

      if (
        values.address.number.trim() &&
        !Number.isFinite(Number(values.address.number))
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Informe um número válido',
          path: ['address', 'number']
        })
      }
    }
  })

export type UserFormValues = z.infer<typeof baseUserFormSchema>

type UserFormProps =
  | {
      mode: 'create'
      initialUser?: never
      onSubmit: (payload: CreateUserPayload) => Promise<void>
    }
  | {
      mode: 'edit'
      initialUser: UserType
      onSubmit: (payload: UpdateUserPayload) => Promise<void>
    }

const toDateInputValue = (value?: string) => value?.slice(0, 10) ?? ''

const toIsoDate = (value: string) =>
  new Date(`${value}T00:00:00`).toISOString()

const getDefaultValues = (user?: UserType): UserFormValues => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  phoneNumber: user?.phoneNumber ?? '',
  birthDate: toDateInputValue(user?.birthDate),
  profileImage: user?.profileImage ?? '',
  profileId: user?.profile.id ?? 0,
  supervisorId: user?.supervisor?.id ?? null,
  departmentId: user?.department?.id ?? null,
  currentSalary: user?.currentSalary ?? 0,
  admissionDate: toDateInputValue(user?.admissionDate),
  currentPosition: user?.currentPosition ?? '',
  employmentStatus: user?.employmentStatus ?? 'active',
  statusReason: user?.statusReason ?? '',
  notes: user?.notes ?? '',
  password: '',
  includeAddress: Boolean(user?.address),
  address: {
    zipCode: user?.address?.zipCode ?? '',
    state: user?.address?.state ?? '',
    city: user?.address?.city ?? '',
    street: user?.address?.street ?? '',
    number: user?.address?.number?.toString() ?? '',
    complement: user?.address?.complement ?? ''
  }
})

export default function UserForm(props: UserFormProps) {
  const { mode } = props
  const initialUser = props.mode === 'edit' ? props.initialUser : undefined
  const [departmentOptions, setDepartmentOptions] = useState<
    { label: string; value: number }[]
  >([])
  const [profileOptions, setProfileOptions] = useState<
    { label: string; value: number }[]
  >([])
  const [supervisorOptions, setSupervisorOptions] = useState<
    { label: string; value: number | '' }[]
  >([])

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UserFormValues>({
    resolver: zodResolver(createUserFormSchema(mode)),
    defaultValues: getDefaultValues(initialUser)
  })

  const employmentStatus = watch('employmentStatus')
  const includeAddress = watch('includeAddress')

  useEffect(() => {
    reset(getDefaultValues(initialUser))
  }, [initialUser, reset])

  useEffect(() => {
    let isMounted = true

    const loadOptions = async () => {
      try {
        const [departments, profiles, supervisorsResponse] = await Promise.all([
          getDepartments(),
          getProfiles(),
          getUsers({ page: 1, pageSize: 100, employmentStatus: 'active' })
        ])

        if (!isMounted) return

        setDepartmentOptions(
          Array.isArray(departments)
            ? departments.map((department) => ({
                label: department.name,
                value: department.id
              }))
            : []
        )
        setProfileOptions(
          profiles.map((profile) => ({
            label: profile.name,
            value: profile.id
          }))
        )
        setSupervisorOptions([
          { label: 'Sem supervisor', value: '' },
          ...(supervisorsResponse?.data ?? [])
            .filter((user) => user.id !== initialUser?.id)
            .map((user) => ({
              label: user.name,
              value: user.id
            }))
        ])
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar as opções do formulário')
      }
    }

    void loadOptions()

    return () => {
      isMounted = false
    }
  }, [initialUser?.id])

  const submitForm = async (values: UserFormValues) => {
    const payload: UserPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      birthDate: values.birthDate ? toIsoDate(values.birthDate) : undefined,
      profileImage: values.profileImage.trim() || undefined,
      profileId: values.profileId,
      supervisorId: values.supervisorId,
      departmentId: values.departmentId,
      currentSalary: values.currentSalary,
      admissionDate: toIsoDate(values.admissionDate),
      currentPosition: values.currentPosition.trim(),
      employmentStatus: values.employmentStatus,
      statusReason:
        values.employmentStatus === 'inactive'
          ? values.statusReason.trim()
          : null,
      notes: values.notes.trim() || undefined,
      ...(values.includeAddress && {
        address: {
          zipCode: values.address.zipCode.trim(),
          state: values.address.state.trim(),
          city: values.address.city.trim(),
          street: values.address.street.trim(),
          number: Number(values.address.number),
          complement: values.address.complement.trim() || null
        }
      })
    }

    if (mode === 'create') {
      await props.onSubmit({ ...payload, password: values.password })
      return
    }

    await props.onSubmit({
      ...payload,
      ...(values.password.trim() && { password: values.password })
    })
  }

  const sectionClasses =
    'rounded-2xl border border-gray-200 bg-white p-5 dark:border-dark-border dark:bg-dark-surface'

  return (
    <form onSubmit={handleSubmit(submitForm)} className="space-y-5">
      <fieldset className={sectionClasses}>
        <legend className="px-2 text-lg font-bold text-primary-dark dark:text-dark-text">
          Dados pessoais
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Nome"
            placeholder="Nome completo"
            error={errors.name?.message}
            {...register('name')}
          />
          <FormField
            label="E-mail"
            type="email"
            placeholder="nome@empresa.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormField
            label="Telefone"
            type="tel"
            placeholder="(00) 00000-0000"
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <FormField
            label="Data de nascimento"
            type="date"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />
          <FormField
            label="Imagem de perfil"
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            error={errors.profileImage?.message}
            className="md:col-span-2"
            {...register('profileImage')}
          />
        </div>
      </fieldset>

      <fieldset className={sectionClasses}>
        <legend className="px-2 text-lg font-bold text-primary-dark dark:text-dark-text">
          Dados profissionais
        </legend>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Cargo"
            placeholder="Cargo atual"
            error={errors.currentPosition?.message}
            {...register('currentPosition')}
          />
          <FormField
            label="Salário atual"
            type="number"
            min="0"
            step="0.01"
            error={errors.currentSalary?.message}
            {...register('currentSalary', { valueAsNumber: true })}
          />
          <FormField
            label="Data de admissão"
            type="date"
            error={errors.admissionDate?.message}
            {...register('admissionDate')}
          />
          <Controller
            name="profileId"
            control={control}
            render={({ field }) => (
              <FormSelectField
                label="Perfil"
                options={profileOptions}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                placeholder="Selecione um perfil"
                error={errors.profileId?.message}
              />
            )}
          />
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <FormSelectField
                label="Departamento"
                options={[
                  { label: 'Sem departamento', value: '' },
                  ...departmentOptions
                ]}
                value={field.value ?? ''}
                onChange={(value) => field.onChange(value || null)}
                placeholder="Selecione um departamento"
                error={errors.departmentId?.message}
              />
            )}
          />
          <Controller
            name="supervisorId"
            control={control}
            render={({ field }) => (
              <FormSelectField
                label="Supervisor"
                options={supervisorOptions}
                value={field.value ?? ''}
                onChange={(value) => field.onChange(value || null)}
                placeholder="Selecione um supervisor"
                error={errors.supervisorId?.message}
              />
            )}
          />
          <Controller
            name="employmentStatus"
            control={control}
            render={({ field }) => (
              <FormSelectField
                label="Situação do vínculo"
                options={[
                  { label: 'Ativo', value: 'active' },
                  { label: 'Inativo', value: 'inactive' },
                  { label: 'Desligado', value: 'terminated' },
                  { label: 'Demissionário', value: 'resigned' }
                ]}
                value={field.value}
                onChange={(value) => field.onChange(value)}
                error={errors.employmentStatus?.message}
              />
            )}
          />
          {employmentStatus === 'inactive' && (
            <TextareaField
              label="Motivo da inativação"
              placeholder="Informe o motivo"
              error={errors.statusReason?.message}
              className="md:col-span-2"
              {...register('statusReason')}
            />
          )}
          <TextareaField
            label="Observações"
            placeholder="Informações adicionais"
            error={errors.notes?.message}
            className="md:col-span-2"
            {...register('notes')}
          />
        </div>
      </fieldset>

      <fieldset className={sectionClasses}>
        <legend className="px-2 text-lg font-bold text-primary-dark dark:text-dark-text">
          Acesso
        </legend>
        <FormField
          label={mode === 'create' ? 'Senha' : 'Nova senha'}
          type="password"
          placeholder={
            mode === 'create'
              ? 'Defina a senha inicial'
              : 'Deixe em branco para manter a senha atual'
          }
          error={errors.password?.message}
          {...register('password')}
        />
      </fieldset>

      <fieldset className={sectionClasses}>
        <legend className="px-2 text-lg font-bold text-primary-dark dark:text-dark-text">
          Endereço
        </legend>
        <Controller
          name="includeAddress"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Incluir endereço"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />

        {includeAddress && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="CEP"
              placeholder="00000-000"
              error={errors.address?.zipCode?.message}
              {...register('address.zipCode')}
            />
            <FormField
              label="Estado"
              placeholder="UF"
              error={errors.address?.state?.message}
              {...register('address.state')}
            />
            <FormField
              label="Cidade"
              placeholder="Cidade"
              error={errors.address?.city?.message}
              {...register('address.city')}
            />
            <FormField
              label="Rua"
              placeholder="Rua ou avenida"
              error={errors.address?.street?.message}
              {...register('address.street')}
            />
            <FormField
              label="Número"
              placeholder="Número"
              error={errors.address?.number?.message}
              {...register('address.number')}
            />
            <FormField
              label="Complemento"
              placeholder="Apartamento, bloco..."
              error={errors.address?.complement?.message}
              {...register('address.complement')}
            />
          </div>
        )}
      </fieldset>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          title="Cancelar"
          href="/gestao/usuarios"
          variant="outline"
          className="w-full sm:w-auto"
        />
        <Button
          title={
            isSubmitting
              ? 'Salvando...'
              : mode === 'create'
                ? 'Cadastrar usuário'
                : 'Salvar alterações'
          }
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        />
      </div>
    </form>
  )
}
