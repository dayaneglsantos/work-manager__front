'use client'

import {
  faArrowsRotate,
  faEnvelope,
  faPen
} from '@fortawesome/free-solid-svg-icons'
import axios from 'axios'
import { useState } from 'react'
import toast from 'react-hot-toast'
import ActionMenu from './ActionMenu'
import Avatar from './Avatar'
import Badge, { type BadgeVariant } from './Badge'
import Button from './Button'
import { EmploymentStatus, UserType } from '@/types/userType'
import { resendPasswordInvitation } from '@/services/userServices'

const statusPresentation: Record<
  EmploymentStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: 'Ativo', variant: 'success' },
  inactive: { label: 'Inativo', variant: 'warning' },
  terminated: { label: 'Desligado', variant: 'error' },
  resigned: { label: 'Demissionário', variant: 'default' }
}

interface UserCardProps {
  user: UserType
}

export default function UserCard({ user }: UserCardProps) {
  const status = statusPresentation[user.employmentStatus]
  const [isResendingInvitation, setIsResendingInvitation] = useState(false)

  const handleResendInvitation = async () => {
    if (isResendingInvitation) return

    setIsResendingInvitation(true)
    const toastId = toast.loading('Reenviando...')

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
    <article className="flex h-fit flex-col rounded-3xl border border-gray-200 bg-white p-5 shadow-lg shadow-primary-dark/5 dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
      <div className="flex items-start gap-4">
        <Avatar src={user.profileImage ?? null} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-primary-dark dark:text-dark-text">
            {user.name}
          </h2>
          <p className="truncate text-sm text-gray-500 dark:text-dark-muted">
            {user.email}
          </p>
        </div>
        <Badge name={status.label} variant={status.variant} />
      </div>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
        <dt className="text-gray-500 dark:text-dark-muted">Departamento</dt>
        <dd className="truncate text-right font-semibold text-primary-dark dark:text-dark-text">
          {user.department?.name ?? 'Sem departamento'}
        </dd>
        <dt className="text-gray-500 dark:text-dark-muted">Cargo</dt>
        <dd className="truncate text-right font-semibold text-primary-dark dark:text-dark-text">
          {user.currentPosition ?? 'Não informado'}
        </dd>
        <dt className="text-gray-500 dark:text-dark-muted">Perfil</dt>
        <dd className="truncate text-right font-semibold text-primary-dark dark:text-dark-text">
          {user.profile.name}
        </dd>
      </dl>

      <div className="mt-5 flex items-center gap-2">
        <Button
          title="Ver detalhes"
          href={`/gestao/usuarios/${user.id}`}
          variant="outline"
          className="flex-1"
        />
        <ActionMenu
          label={`Mais ações para ${user.name}`}
          items={[
            {
              label: 'Editar',
              href: `/gestao/usuarios/${user.id}/editar`,
              icon: faPen
            },
            ...(!user.hasPassword
              ? [
                  {
                    label: isResendingInvitation
                      ? 'Reenviando...'
                      : 'Reenviar convite',
                    icon: faEnvelope,
                    disabled: isResendingInvitation,
                    onClick: handleResendInvitation
                  }
                ]
              : []),
            {
              label: 'Atualizar status (em breve)',
              icon: faArrowsRotate,
              disabled: true
            }
          ]}
        />
      </div>
    </article>
  )
}
