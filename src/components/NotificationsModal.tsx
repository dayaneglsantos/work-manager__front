'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBell,
  faBullhorn,
  faCheckDouble,
  faCircleInfo,
  faListCheck
} from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

type NotificationType = 'task' | 'announcement' | 'system'

interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  time: string
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'task',
    title: 'Nova tarefa atribuída',
    message: 'Você recebeu uma nova tarefa para acompanhar.',
    time: 'Agora',
    read: false
  },
  {
    id: 2,
    type: 'announcement',
    title: 'Novo comunicado',
    message: 'Um novo comunicado foi publicado para sua equipe.',
    time: 'Há 10 min',
    read: false
  },
  {
    id: 3,
    type: 'system',
    title: 'Bem-vindo ao Work Manager',
    message: 'Acompanhe por aqui as novidades importantes da plataforma.',
    time: 'Ontem',
    read: true
  }
]

const notificationIcons = {
  task: faListCheck,
  announcement: faBullhorn,
  system: faCircleInfo
}

export default function NotificationsModal({
  open,
  onClose,
  onUnreadCountChange
}: {
  open: boolean
  onClose: () => void
  onUnreadCountChange: (count: number) => void
}) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  if (!open) return null

  const markAllAsRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true
      }))
    )
    onUnreadCountChange(0)
  }

  const markAsRead = (notificationId: number) => {
    const selectedNotification = notifications.find(
      (notification) => notification.id === notificationId
    )

    if (!selectedNotification || selectedNotification.read) return

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
    onUnreadCountChange(unreadCount - 1)
  }

  return (
    <div
      className="fixed inset-0 z-40"
      aria-hidden={!open}
      onClick={onClose}
    >
      <section
        id="notifications-panel"
        aria-label="Notificações"
        className="absolute top-16 right-4 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-primary-dark/10 dark:border-dark-border dark:bg-dark-surface dark:shadow-black/20"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 dark:border-dark-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-primary-dark dark:text-dark-text">
                Notificações
              </h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary dark:bg-primary-light/10 dark:text-purple-200">
                  {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-dark-muted">
              Acompanhe as novidades importantes.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-purple-50 dark:text-purple-200 dark:hover:bg-dark-surface-hover"
            >
              <FontAwesomeIcon icon={faCheckDouble} className="h-3.5 w-3.5" />
              Marcar como lidas
            </button>
          )}
        </header>

        {notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                role={notification.read ? undefined : 'button'}
                tabIndex={notification.read ? undefined : 0}
                aria-label={
                  notification.read
                    ? undefined
                    : `Marcar “${notification.title}” como lida`
                }
                onClick={() => markAsRead(notification.id)}
                onKeyDown={(event) => {
                  if (
                    !notification.read &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault()
                    markAsRead(notification.id)
                  }
                }}
                className={`relative flex gap-3 border-b border-gray-100 px-5 py-4 transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset focus-visible:outline-none dark:border-dark-border ${
                  notification.read
                    ? 'bg-white hover:bg-gray-50 dark:bg-dark-surface dark:hover:bg-dark-surface-hover/70'
                    : 'cursor-pointer bg-purple-50/60 hover:bg-purple-50 dark:bg-primary/5 dark:hover:bg-primary/10'
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-purple-200">
                  <FontAwesomeIcon
                    icon={notificationIcons[notification.type]}
                    className="h-4 w-4"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-primary-dark dark:text-dark-text">
                      {notification.title}
                    </h3>
                    <time className="shrink-0 text-[11px] text-gray-400 dark:text-dark-muted">
                      {notification.time}
                    </time>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-dark-muted">
                    {notification.message}
                  </p>
                </div>

                {!notification.read && (
                  <span
                    aria-label="Não lida"
                    className="absolute top-1/2 right-2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary"
                  />
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-purple-200">
              <FontAwesomeIcon icon={faBell} className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-primary-dark dark:text-dark-text">
              Tudo tranquilo por aqui
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-dark-muted">
              Você não possui novas notificações.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
