'use client'
import { useState } from 'react'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import NotificationsModal from './NotificationsModal'
import ThemeToggle from './ToggleTheme'
import Avatar from './Avatar'
import AvatarModal from './AvatarModal'
import { getSession } from '@/utils/getSession'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [avatarModalOpen, setAvatarModalOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(2)
  const user = getSession()
  const [avatar, setAvatar] = useState<string | null>(user?.profileImage ?? null)

  const currentDate = new Date()
  const formattedDate = format(
    currentDate,
    "EEEE, dd 'de' MMMM 'de' yyyy",
    { locale: ptBR }
  )

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

            <button
              type="button"
              aria-label="Alterar avatar"
              title="Alterar avatar"
              onClick={() => setAvatarModalOpen(true)}
              className="cursor-pointer rounded-full ring-2 ring-transparent transition-all hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:hover:ring-primary-light/30 dark:focus-visible:ring-offset-dark-background"
            >
              <Avatar src={avatar} />
            </button>
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
        currentAvatar={avatar}
        onClose={() => setAvatarModalOpen(false)}
        onApply={setAvatar}
      />
    </>
  )
}
