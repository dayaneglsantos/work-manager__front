'use client'
import { useState } from 'react'
import Image from 'next/image'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import NotificationsModal from './NotificationsModal'
import ThemeToggle from './ToggleTheme'
import Avatar from './Avatar'
import { getSession } from '@/utils/getSession'

export default function Header() {
  const [open, setOpen] = useState(false)
  const session = getSession()

  const currentDate = new Date()

  return (
    <>
      <div className="h-16 p-2 pr-6 flex  items-center justify-between">
        <span className="font-bold md:ml-6">
          Olá Dayane, hoje é{' '}
          {format(currentDate, " EEEE, 'dia' dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
          })}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div
            className="relative cursor-pointer"
            onClick={() => setOpen(!open)}
          >
            <FontAwesomeIcon icon={faBell} size="xl" />
            <span className="absolute -top-1 rounded-full p-2 bg-error w-2 h-2 text-xs font-bold text-white flex items-center justify-center -right-1">
              1
            </span>
          </div>

          <Avatar src={session?.profileImage} />
        </div>
      </div>
      <NotificationsModal open={open} onClose={() => setOpen(!open)} />
    </>
  )
}
