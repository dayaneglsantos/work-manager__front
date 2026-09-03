import Badge from '@/components/Badge'
import { ProfileListItem } from '@/types/profileType'
import {
  faPencil,
  faTrashCan,
  faUsers
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useId } from 'react'
import { Tooltip } from 'react-tooltip'

interface ProfileCardProps {
  profile: ProfileListItem
  onEdit?: () => void
  onDelete?: () => void
}

export default function ProfileCard({
  profile,
  onEdit,
  onDelete
}: ProfileCardProps) {
  const tooltipId = useId()
  const hasUsers = profile.userCount > 0
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 break-words text-lg font-bold text-primary-dark dark:text-dark-text">
          {profile.name}
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          {!profile.fullAccess && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Editar perfil ${profile.name}`}
              title="Editar perfil"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-primary-dark transition-colors hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-purple-200"
            >
              <FontAwesomeIcon
                icon={faPencil}
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          )}
          {!profile.fullAccess && onDelete && (
            <div>
              <button
                type="button"
                aria-label={`Excluir perfil ${profile.name}`}
                aria-disabled={hasUsers}
                data-tooltip-id={hasUsers ? tooltipId : undefined}
                title={hasUsers ? undefined : 'Excluir perfil'}
                onClick={() => {
                  if (!hasUsers) onDelete()
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-error focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary dark:text-red-300 ${hasUsers ? 'cursor-default opacity-40' : 'cursor-pointer transition-colors hover:bg-error/10'}`}
              >
                <FontAwesomeIcon
                  icon={faTrashCan}
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
              {hasUsers && (
                <Tooltip
                  id={tooltipId}
                  content="Este perfil possui usuários vinculados e não pode ser excluído."
                  place="top"
                  offset={4}
                  positionStrategy="fixed"
                  globalCloseEvents={{ escape: true }}
                  style={{ maxWidth: 'min(16rem, 75vw)', zIndex: 60, borderRadius: 8 }}
                />
              )}
            </div>
          )}
          {profile.fullAccess && (
            <Badge name="Acesso total" variant="warning" />
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge
          name={`${profile.userCount} ${profile.userCount === 1 ? 'usuário' : 'usuários'}`}
          icon={faUsers}
          className="flex-row-reverse"
        />
      </div>
      {profile.fullAccess && (
        <p className="mt-4 text-sm leading-6 text-gray-600 dark:text-dark-muted">
          Perfil protegido
        </p>
      )}
    </article>
  )
}
