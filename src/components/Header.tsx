'use client'
import { useEffect, useRef, useState } from 'react'
import { faBell, faCamera, faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'
import toast from 'react-hot-toast'
import NotificationsModal from './NotificationsModal'
import ThemeToggle from './ToggleTheme'
import Avatar from './Avatar'
import AvatarModal from './AvatarModal'
import { useAuth } from '@/contexts/AuthContext'
import { removeProfileImage, uploadProfileImage } from '@/services/userServices'
import { ProfileImageChange } from '@/types/userType'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(2)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const { session: user, saveSession } = useAuth()

  useEffect(() => {
    if (!profileMenuOpen) return

    const closeMenu = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileMenuOpen(false)
    }

    document.addEventListener('mousedown', closeMenu)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeMenu)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileMenuOpen])

  const applyAvatar = async (change: ProfileImageChange) => {
    if (!user) throw new Error('Session not found')

    try {
      const result = change.file
        ? await uploadProfileImage(user.id, change.file)
        : await removeProfileImage(user.id)

      saveSession({ ...user, profileImage: result.profileImage })
      toast.success('Avatar atualizado com sucesso')
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível alterar o avatar')
      throw error
    }
  }

  const currentDate = new Date()
  const formattedDate = format(currentDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
    locale: ptBR
  })

  const greeting = (
    <div className="min-w-0">
      <p className="truncate font-bold text-primary-dark dark:text-dark-text">
        Olá, {user?.name}!
      </p>
      <time
        dateTime={format(currentDate, 'yyyy-MM-dd')}
        className="mt-0.5 block text-sm capitalize text-gray-500 dark:text-dark-muted"
      >
        {formattedDate}
      </time>
    </div>
  )

  return (
    <>
      <header className="w-full px-3 pt-3 pb-3 sm:px-6 sm:py-2">
        <div className="flex items-center justify-end gap-3 pl-12 sm:min-h-12 sm:justify-between sm:pl-0">
          <div className="hidden min-w-0 sm:block">{greeting}</div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              aria-label={`Notificações: ${unreadNotifications} não lidas`}
              aria-expanded={open}
              aria-controls="notifications-panel"
              title="Notificações"
              className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-dark-background ${
                open
                  ? 'border-primary/30 bg-primary/10 text-primary dark:border-primary-light/30 dark:bg-primary-light/10 dark:text-purple-200'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/20 hover:bg-purple-50 hover:text-primary dark:border-dark-border dark:bg-dark-surface dark:text-dark-muted dark:hover:bg-dark-surface-hover dark:hover:text-dark-text'
              }`}
              onClick={() => setOpen((currentOpen) => !currentOpen)}
            >
              <FontAwesomeIcon icon={faBell} className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-error px-1 text-[10px] font-bold leading-none text-white dark:border-dark-background">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                aria-label="Abrir opções do perfil"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                title="Opções do perfil"
                onClick={() => setProfileMenuOpen((current) => !current)}
                className="cursor-pointer rounded-full ring-2 ring-transparent transition-all hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:ring-primary-light/30 dark:focus-visible:ring-offset-dark-background"
              >
                <Avatar src={user?.profileImage ?? null} />
              </button>

              {profileMenuOpen && user && (
                <div
                  role="menu"
                  className="absolute top-full right-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-primary-dark/10 dark:border-dark-border dark:bg-dark-surface dark:shadow-black/30"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setProfileMenuOpen(false)
                      setAvatarModalOpen(true)
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-primary-dark transition-colors hover:bg-purple-50 dark:text-dark-text dark:hover:bg-dark-surface-hover"
                  >
                    <FontAwesomeIcon
                      icon={faCamera}
                      className="h-4 w-4 text-primary"
                    />
                    Alterar avatar
                  </button>
                  <Link
                    href={`/gestao/usuarios/${user.id}/editar`}
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-dark transition-colors hover:bg-purple-50 dark:text-dark-text dark:hover:bg-dark-surface-hover"
                  >
                    <FontAwesomeIcon
                      icon={faPen}
                      className="h-4 w-4 text-primary"
                    />
                    Editar dados
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 sm:hidden">{greeting}</div>
      </header>
      <NotificationsModal
        open={open}
        onClose={() => setOpen(false)}
        onUnreadCountChange={setUnreadNotifications}
      />
      <AvatarModal
        open={avatarModalOpen}
        currentAvatar={user?.profileImage ?? null}
        onClose={() => setAvatarModalOpen(false)}
        onApply={applyAvatar}
      />
    </>
  )
}
