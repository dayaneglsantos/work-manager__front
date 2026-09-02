'use client'

import Avatar from '@/components/Avatar'
import Badge, { BadgeVariant } from '@/components/Badge'
import Breadcrumb from '@/components/Breadcrumb'
import Button from '@/components/Button'
import { getUserById, resendPasswordInvitation } from '@/services/userServices'
import { EmploymentStatus, UserType } from '@/types/userType'
import {
  faEnvelope,
  faPen,
  faShieldHalved
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import axios from 'axios'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const statusPresentation: Record<
  EmploymentStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'warning' },
  terminated: { label: 'Desligado', variant: 'error' },
  resigned: { label: 'Demissionário', variant: 'default' }
}

const formatDate = (value?: string) => {
  if (!value) return 'Não informada'
  const [year, month, day] = value.slice(0, 10).split('-')
  return year && month && day ? `${day}/${month}/${year}` : value
}

const formatCpf = (value?: string) => {
  if (!value) return 'Não informado'
  const digits = value.replace(/\D/g, '')
  return digits.length === 11
    ? digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    : value
}

const formatPhone = (value?: string) => {
  if (!value) return 'Não informado'
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11)
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (digits.length === 10)
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return value
}

const formatCurrency = (value?: number) =>
  value === undefined
    ? 'Não informado'
    : new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)

export default function Page() {
  const params = useParams<{ id: string }>()
  const userId = Number(params.id)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isResendingInvitation, setIsResendingInvitation] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (!Number.isInteger(userId) || userId <= 0) {
        setHasError(true)
        setIsLoading(false)
        return
      }

      try {
        const data = await getUserById(userId)
        if (isMounted) setUser(data)
      } catch (error) {
        console.error(error)
        if (isMounted) setHasError(true)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadUser()
    return () => {
      isMounted = false
    }
  }, [userId])

  const handleResendInvitation = async () => {
    if (!user || user.hasPassword || isResendingInvitation) return

    setIsResendingInvitation(true)
    const toastId = toast.loading('Reenviando convite...')
    try {
      await resendPasswordInvitation(user.id)
      toast.success('Convite reenviado com sucesso', { id: toastId })
    } catch (error) {
      console.error(error)
      const message = axios.isAxiosError<{ error?: string }>(error)
        ? error.response?.data.error
        : undefined
      toast.error(
        message ?? 'Não foi possível reenviar o convite. Tente novamente.',
        { id: toastId }
      )
    } finally {
      setIsResendingInvitation(false)
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Breadcrumb
          items={[
            { label: 'Gestão', href: '/gestao' },
            { label: 'Usuários', href: '/gestao/usuarios' },
            { label: 'Detalhes do usuário' }
          ]}
        />
        {user && !isLoading && !hasError && (
          <UserActions
            user={user}
            isResendingInvitation={isResendingInvitation}
            onResendInvitation={handleResendInvitation}
          />
        )}
      </div>

      {isLoading ? (
        <StateCard message="Carregando usuário..." />
      ) : hasError || !user ? (
        <StateCard
          message="Não foi possível carregar os dados do usuário."
          error
        />
      ) : (
        <UserDetails user={user} />
      )}
    </section>
  )
}

function UserActions({
  user,
  isResendingInvitation,
  onResendInvitation
}: {
  user: UserType
  isResendingInvitation: boolean
  onResendInvitation: () => void
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
      {!user.hasPassword && (
        <Button
          title={isResendingInvitation ? 'Reenviando...' : 'Reenviar convite'}
          icon={faEnvelope}
          variant="outline"
          disabled={isResendingInvitation}
          onClick={onResendInvitation}
          className="min-w-0 flex-1 whitespace-nowrap sm:flex-none"
          size="sm"
        />
      )}
      <Button
        title="Editar dados"
        icon={faPen}
        href={`/gestao/usuarios/${user.id}/editar`}
        className="min-w-0 flex-1 whitespace-nowrap sm:flex-none"
        size="sm"
      />
      <Button
        title="Editar permissões"
        icon={faShieldHalved}
        href={`/gestao/usuarios/${user.id}/permissoes`}
        className="min-w-0 flex-1 whitespace-nowrap sm:flex-none"
        size="sm"
      />
    </div>
  )
}

function UserDetails({ user }: { user: UserType }) {
  const status = statusPresentation[user.employmentStatus]
  const address = user.address

  return (
    <>
      <header className="flex flex-col gap-5 rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-primary-dark/5 sm:flex-row sm:items-center dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
        <Avatar src={user.profileImage ?? null} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
              {user.name}
            </h1>
            <Badge name={status.label} variant={status.variant} />
          </div>
          <p className="mt-2 text-gray-500 dark:text-dark-muted">
            {user.email}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge name={user.profile.name} />
            <Badge
              name={user.department?.name ?? 'Sem departamento'}
              variant={user.department ? 'info' : 'default'}
            />
            {!user.hasPassword && (
              <Badge name="Convite pendente" variant="warning" />
            )}
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6">
        <DetailsSection title="Dados pessoais">
          <Detail label="Nome completo" value={user.name} />
          <Detail label="E-mail" value={user.email} />
          <Detail label="CPF" value={formatCpf(user.cpf)} />
          <Detail label="Telefone" value={formatPhone(user.phoneNumber)} />
          <Detail
            label="Data de nascimento"
            value={formatDate(user.birthDate)}
          />
          <Detail
            label="Acesso"
            value={user.hasPassword ? 'Senha criada' : 'Convite pendente'}
          />

          <div className="col-span-full mt-2 border-t border-gray-100 pt-4 dark:border-dark-border">
            <h3 className="font-semibold text-primary-dark dark:text-dark-text">
              Endereço
            </h3>
          </div>
          {address ? (
            <>
              <Detail label="CEP" value={address.zipCode} />
              <Detail label="Estado" value={address.state} />
              <Detail label="Cidade" value={address.city} />
              <Detail label="Logradouro" value={address.street} />
              <Detail label="Número" value={String(address.number)} />
              <Detail
                label="Complemento"
                value={address.complement || 'Não informado'}
              />
            </>
          ) : (
            <p className="col-span-full text-sm text-gray-500 dark:text-dark-muted">
              Nenhum endereço cadastrado.
            </p>
          )}
        </DetailsSection>

        <DetailsSection title="Dados profissionais">
          <Detail
            label="Cargo"
            value={user.currentPosition ?? 'Não informado'}
          />
          <Detail label="Perfil" value={user.profile.name} />
          <Detail
            label="Departamento"
            value={user.department?.name ?? 'Sem departamento'}
          />
          <Detail
            label="Data de admissão"
            value={formatDate(user.admissionDate)}
          />
          <Detail
            label="Salário atual"
            value={formatCurrency(user.currentSalary)}
          />
          <Detail label="Situação" value={status.label} />
          {user.statusReason && (
            <Detail label="Motivo da situação" value={user.statusReason} wide />
          )}
        </DetailsSection>

        <DetailsSection title="Observações">
          <p className="col-span-full whitespace-pre-wrap text-sm leading-6 text-primary-dark dark:text-dark-text">
            {user.notes || 'Nenhuma observação cadastrada.'}
          </p>
        </DetailsSection>
      </div>
    </>
  )
}

function DetailsSection({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface">
      <h2 className="border-b border-purple-100 bg-purple-50/70 px-5 py-4 text-lg font-bold text-primary-dark dark:border-dark-border dark:bg-primary/10 dark:text-dark-text">
        {title}
      </h2>
      <dl className="grid gap-x-6 gap-y-4 p-5 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

function Detail({
  label,
  value,
  wide = false
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-dark-text">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-primary-dark dark:text-dark-muted">
        {value}
      </dd>
    </div>
  )
}

function StateCard({
  message,
  error = false
}: {
  message: string
  error?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border px-6 py-16 text-center text-sm ${
        error
          ? 'border-error/20 bg-error/5 text-error dark:text-red-300'
          : 'border-dashed border-gray-300 text-gray-500 dark:border-dark-border dark:text-dark-muted'
      }`}
    >
      {message}
    </div>
  )
}
