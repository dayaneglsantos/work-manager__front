'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, Resolver, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getDepartments } from '@/services/departmentServices'
import { getProfiles } from '@/services/profileServices'
import { isValidCpf, normalizeCpf } from '@/utils/cpf'
import {
  CreateUserPayload,
  ProfileImageChange,
  SelfProfilePayload,
  SelfProfileType,
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
import PhoneField from './PhoneField'
import ProfileImageField from './ProfileImageField'
import TextareaField from './TextareaField'
import ZipCodeField from './ZipCodeField'

const onlyDigits = (value: string) => value.replace(/\D/g, '')

const baseUserFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  email: z.string().trim().email('Informe um e-mail válido'),
  cpf: z.string().refine(isValidCpf, 'Informe um CPF válido'),
  phoneNumber: z
    .string()
    .regex(/^\d{10,11}$/, 'Informe um telefone com 10 ou 11 dígitos'),
  birthDate: z.string(),
  profileId: z.number({ invalid_type_error: 'Selecione um perfil' }).min(1),
  departmentId: z.number().nullable(),
  currentSalary: z
    .number({ invalid_type_error: 'Informe o salário atual' })
    .nonnegative('O salário não pode ser negativo'),
  admissionDate: z.string().min(1, 'Informe a data de admissão'),
  currentPosition: z.string().trim().min(1, 'Informe o cargo'),
  employmentStatus: z.enum(['active', 'inactive', 'terminated', 'resigned']),
  statusReason: z.string(),
  notes: z.string(),
  address: z.object({
    zipCode: z.string(),
    state: z.string(),
    city: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string()
  })
})

type AddressFormValues = z.infer<typeof baseUserFormSchema>['address']

const validateAddress = (
  address: AddressFormValues,
  context: z.RefinementCtx
) => {
  const hasAddressValues = Object.values(address).some((value) => value.trim())

  if (!hasAddressValues) return

  const requiredAddressFields = [
    ['zipCode', 'Informe o CEP'],
    ['state', 'Informe o estado'],
    ['city', 'Informe a cidade'],
    ['street', 'Informe o logradouro'],
    ['number', 'Informe o número']
  ] as const

  requiredAddressFields.forEach(([field, message]) => {
    if (!address[field].trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message,
        path: ['address', field]
      })
    }
  })

  if (address.zipCode.trim() && !/^\d{8}$/.test(address.zipCode)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe um CEP com 8 dígitos',
      path: ['address', 'zipCode']
    })
  }

  if (address.number.trim() && !Number.isFinite(Number(address.number))) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe um número válido',
      path: ['address', 'number']
    })
  }
}

const userFormSchema = baseUserFormSchema.superRefine((values, context) => {
  // Validação condicional para o campo "statusReason" que deve ser preenchido se o "employmentStatus" for "inactive"
  if (values.employmentStatus === 'inactive' && !values.statusReason.trim()) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Informe o motivo da inativação',
      path: ['statusReason']
    })
  }

  validateAddress(values.address, context)
})

const selfProfileFormSchema = baseUserFormSchema
  .pick({
    name: true,
    email: true,
    cpf: true,
    phoneNumber: true,
    birthDate: true,
    address: true
  })
  .superRefine((values, context) => validateAddress(values.address, context))

export type UserFormValues = z.infer<typeof baseUserFormSchema>

type UserFormProps =
  | {
      mode: 'create'
      initialUser?: never
      onSubmit: (
        payload: CreateUserPayload,
        profileImage: ProfileImageChange
      ) => Promise<void>
    }
  | {
      mode: 'self-edit'
      initialUser: SelfProfileType
      onSubmit: (
        payload: SelfProfilePayload,
        profileImage: ProfileImageChange
      ) => Promise<void>
    }
  | {
      mode: 'edit'
      initialUser: UserType
      onSubmit: (
        payload: UpdateUserPayload,
        profileImage: ProfileImageChange
      ) => Promise<void>
    }

const toDateInputValue = (value?: string | null) => value?.slice(0, 10) ?? ''

const getDefaultValues = (
  user?: UserType | SelfProfileType
): UserFormValues => {
  const managedUser = user && 'employmentStatus' in user ? user : undefined

  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    cpf: normalizeCpf(user?.cpf ?? ''),
    phoneNumber: onlyDigits(user?.phoneNumber ?? ''),
    birthDate: toDateInputValue(user?.birthDate),
    profileId: user?.profile.id ?? 0,
    departmentId: managedUser?.department?.id ?? null,
    currentSalary: managedUser?.currentSalary ?? 0,
    admissionDate: toDateInputValue(managedUser?.admissionDate),
    currentPosition: managedUser?.currentPosition ?? '',
    employmentStatus: managedUser?.employmentStatus ?? 'active',
    statusReason: managedUser?.statusReason ?? '',
    notes: managedUser?.notes ?? '',
    address: {
      zipCode: onlyDigits(user?.address?.zipCode ?? ''),
      state: user?.address?.state ?? '',
      city: user?.address?.city ?? '',
      street: user?.address?.street ?? '',
      number: user?.address?.number?.toString() ?? '',
      complement: user?.address?.complement ?? ''
    }
  }
}

export default function UserForm(props: UserFormProps) {
  const { mode } = props
  const initialUser = props.mode === 'create' ? undefined : props.initialUser
  const isSelfEdit = mode === 'self-edit'
  const [departmentOptions, setDepartmentOptions] = useState<
    { label: string; value: number }[]
  >([])
  const [profileOptions, setProfileOptions] = useState<
    { label: string; value: number }[]
  >([])
  const [profileImage, setProfileImage] = useState<ProfileImageChange>({
    file: null,
    removeCurrentImage: false
  })

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UserFormValues>({
    resolver: zodResolver(
      isSelfEdit ? selfProfileFormSchema : userFormSchema
    ) as unknown as Resolver<UserFormValues>,
    defaultValues: getDefaultValues(initialUser)
  })

  const employmentStatus = watch('employmentStatus')
  const birthDate = watch('birthDate')
  const admissionDate = watch('admissionDate')

  useEffect(() => {
    reset(getDefaultValues(initialUser))
    setProfileImage({ file: null, removeCurrentImage: false })
  }, [initialUser, reset])

  useEffect(() => {
    let isMounted = true

    const loadOptions = async () => {
      if (isSelfEdit) return

      try {
        const [departments, profiles] = await Promise.all([
          getDepartments(),
          getProfiles()
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
      } catch (error) {
        console.error(error)
        toast.error('Erro ao carregar as opções do formulário')
      }
    }

    void loadOptions()

    return () => {
      isMounted = false
    }
  }, [isSelfEdit])

  const submitForm = async (values: UserFormValues) => {
    const hasAddressValues = Object.values(values.address).some((value) =>
      value.trim()
    )

    const address = hasAddressValues
      ? {
          zipCode: values.address.zipCode.trim(),
          state: values.address.state.trim(),
          city: values.address.city.trim(),
          street: values.address.street.trim(),
          number: Number(values.address.number),
          complement: values.address.complement.trim() || null
        }
      : null

    if (props.mode === 'self-edit') {
      await props.onSubmit(
        {
          name: values.name.trim(),
          phoneNumber: values.phoneNumber.trim(),
          birthDate: values.birthDate || null,
          address
        },
        profileImage
      )
      return
    }

    const payload: UserPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      cpf: normalizeCpf(values.cpf),
      phoneNumber: values.phoneNumber.trim(),
      birthDate: values.birthDate || undefined,
      profileId: values.profileId,
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
      ...(address && { address })
    }

    await props.onSubmit(payload, profileImage)
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
            <ProfileImageField
              currentImage={initialUser?.profileImage}
              onChange={(file, removeCurrentImage) =>
                setProfileImage({ file, removeCurrentImage })
              }
            />
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
              disabled={isSelfEdit}
              inputClassName={
                isSelfEdit ? 'cursor-not-allowed opacity-70' : undefined
              }
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
                  disabled={isSelfEdit}
                />
              )}
            />
            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <PhoneField
                  required
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.phoneNumber?.message}
                />
              )}
            />
            <FormField
              label="Data de nascimento"
              type="date"
              inputClassName={birthDate ? undefined : 'date-input--empty'}
              error={errors.birthDate?.message}
              {...register('birthDate')}
            />
          </div>
        </div>
      </section>

      {!isSelfEdit && (
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
                inputClassName={admissionDate ? undefined : 'date-input--empty'}
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
      )}

      <section aria-labelledby="address-title">
        <h2 id="address-title" className={sectionTitleClasses}>
          Endereço
        </h2>
        <div className={sectionClasses}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Controller
              name="address.zipCode"
              control={control}
              render={({ field }) => (
                <ZipCodeField
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.address?.zipCode?.message}
                />
              )}
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
          href={isSelfEdit ? '/' : '/gestao/usuarios'}
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
