'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getDepartments } from '@/services/departmentServices'
import { getProfiles } from '@/services/profileServices'
import { getUsers } from '@/services/userServices'
import { isValidCpf, normalizeCpf } from '@/utils/cpf'
import {
  CreateUserPayload,
  UpdateUserPayload,
  UserPayload,
  UserType
} from '@/types/userType'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Button from './Button'
import CpfField from './CpfField'
import CurrencyField from './CurrencyField'
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
  cpf: z.string().refine(isValidCpf, 'Informe um CPF válido'),
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
  employmentStatus: z.enum(['active', 'inactive', 'terminated', 'resigned']),
  statusReason: z.string(),
  notes: z.string(),
  password: z.string(),
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

    const hasAddressValues = Object.values(values.address).some((value) =>
      value.trim()
    )

    if (hasAddressValues) {
      const requiredAddressFields = [
        ['zipCode', 'Informe o CEP'],
        ['state', 'Informe o estado'],
        ['city', 'Informe a cidade'],
        ['street', 'Informe o logradouro'],
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

const getDefaultValues = (user?: UserType): UserFormValues => ({
  name: user?.name ?? '',
  email: user?.email ?? '',
  cpf: normalizeCpf(user?.cpf ?? ''),
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
    const hasAddressValues = Object.values(values.address).some((value) =>
      value.trim()
    )

    const payload: UserPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      cpf: normalizeCpf(values.cpf),
      phoneNumber: values.phoneNumber.trim(),
      birthDate: values.birthDate || undefined,
      profileImage: values.profileImage.trim() || undefined,
      profileId: values.profileId,
      supervisorId: values.supervisorId,
      departmentId: values.departmentId,
      currentSalary: values.currentSalary,
      admissionDate: values.admissionDate,
      currentPosition: values.currentPosition.trim(),
      employmentStatus: values.employmentStatus,
      statusReason:
        values.employmentStatus === 'inactive'
          ? values.statusReason.trim()
          : null,
      notes: values.notes.trim() || undefined,
      ...(hasAddressValues && {
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
  const sectionTitleClasses =
    'mb-2 text-lg ml-4 font-bold text-primary-dark dark:text-dark-text'

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      autoComplete="off"
      className="space-y-5"
    >
      <section aria-labelledby="personal-data-title">
        <h2 id="personal-data-title" className={sectionTitleClasses}>
          Dados pessoais
        </h2>
        <div className={sectionClasses}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Nome"
              required
              placeholder="Nome completo"
              error={errors.name?.message}
              {...register('name')}
            />
            <FormField
              label="E-mail"
              type="email"
              required
              autoComplete="off"
              placeholder="nome@empresa.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <CpfField
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.cpf?.message}
                />
              )}
            />
            <FormField
              label="Telefone"
              type="tel"
              required
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
        </div>
      </section>

      <section aria-labelledby="professional-data-title">
        <h2 id="professional-data-title" className={sectionTitleClasses}>
          Dados profissionais
        </h2>
        <div className={sectionClasses}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              label="Cargo"
              required
              placeholder="Cargo atual"
              error={errors.currentPosition?.message}
              {...register('currentPosition')}
            />
            <Controller
              name="currentSalary"
              control={control}
              render={({ field }) => (
                <CurrencyField
                  label="Salário atual"
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.currentSalary?.message}
                />
              )}
            />
            <FormField
              label="Data de admissão"
              type="date"
              required
              error={errors.admissionDate?.message}
              {...register('admissionDate')}
            />
            <Controller
              name="profileId"
              control={control}
              render={({ field }) => (
                <FormSelectField
                  label="Perfil"
                  required
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
                  required
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
                required
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
        </div>
      </section>

      <section aria-labelledby="access-data-title">
        <h2 id="access-data-title" className={sectionTitleClasses}>
          Acesso
        </h2>
        <div className={sectionClasses}>
          <FormField
            label={mode === 'create' ? 'Senha' : 'Nova senha'}
            type="password"
            required={mode === 'create'}
            autoComplete="new-password"
            placeholder={
              mode === 'create'
                ? 'Defina a senha inicial'
                : 'Deixe em branco para manter a senha atual'
            }
            error={errors.password?.message}
            {...register('password')}
          />
        </div>
      </section>

      <section aria-labelledby="address-title">
        <h2 id="address-title" className={sectionTitleClasses}>
          Endereço
        </h2>
        <div className={sectionClasses}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </div>
      </section>

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
