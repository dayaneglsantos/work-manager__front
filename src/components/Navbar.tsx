'use client'
import Image from 'next/image'
import logo from '@/assets/images/logo.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faBullhorn,
  faHouse,
  faListCheck,
  faMoneyCheckDollar,
  faUsersCog,
  faWrench
} from '@fortawesome/free-solid-svg-icons'
import { faPersonWalkingArrowRight } from '@fortawesome/free-solid-svg-icons/faPersonWalkingArrowRight'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useRef, useState } from 'react'

const menuList = [
  { name: 'Início', icon: faHouse, path: '/' },
  { name: 'Tarefas', icon: faListCheck, path: '/tarefas' },
  { name: 'Comunicados', icon: faBullhorn, path: '/comunicados' },
  {
    name: 'Pagamentos',
    icon: faMoneyCheckDollar,
    path: '/pagamentos'
  },
  { name: 'Chamados', icon: faWrench, path: '/chamados' },
  { name: 'Gestão', icon: faUsersCog, path: '/gestao' },
  { name: 'Sair', icon: faPersonWalkingArrowRight, path: '/logout' }
]

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { clearSession, isLoggingOut } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) // Verifica se o clique foi fora do menuRef
      ) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu"
        className="fixed top-3 left-3 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-gray-200 bg-white text-primary-dark shadow-sm transition-colors hover:bg-purple-50 md:hidden dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:hover:bg-dark-surface-hover"
        onClick={() => setOpenMenu(!openMenu)}
      >
        <FontAwesomeIcon
          icon={faBars}
          className="h-5 w-5"
        />
      </button>
      <div
        className={`fixed top-0 left-0 z-50 flex h-screen w-56 flex-col items-center border-r border-gray-200 bg-white/95 p-3 backdrop-blur transition-transform duration-300 ease-out dark:border-dark-border dark:bg-dark-surface/95 ${openMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:w-[68px]`}
        ref={menuRef}
      >
        <div className="flex w-full items-center justify-between md:justify-center">
          <Image
            src={logo}
            alt="Logo Work Manager"
            className="h-11 w-11 rounded-full object-contain"
          />
          <button
            type="button"
            aria-label="Fechar menu"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-primary-dark transition-colors hover:bg-purple-50 md:hidden dark:text-dark-text dark:hover:bg-dark-surface-hover"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <FontAwesomeIcon
              icon={faBars}
              className="h-5 w-5"
            />
          </button>
        </div>

        <nav className="mt-8 flex w-full grow flex-col items-center gap-2">
          {menuList.map((item, index) => {
            const isLogout = item.name === 'Sair'
            const isActive =
              !isLogout &&
              (item.path === '/'
                ? pathname === '/'
                : pathname.startsWith(item.path))

            return (
              <button
                type="button"
                className={`group relative z-10 flex h-11 w-full cursor-pointer items-center overflow-hidden rounded-xl px-3 transition-all duration-300 md:w-fit md:max-w-11 md:self-start md:hover:max-w-40 ${index === menuList.length - 1 ? 'mt-auto' : ''} ${isActive ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-primary-dark hover:bg-purple-50 hover:text-primary dark:text-dark-muted dark:hover:bg-dark-surface-hover dark:hover:text-purple-200'} ${isLogout && isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
                key={item.name}
                aria-current={isActive ? 'page' : undefined}
                aria-disabled={isLogout && isLoggingOut}
                onClick={() => {
                  if (isLogout) {
                    if (isLoggingOut) return
                    void clearSession()
                  } else {
                    router.push(item.path)
                    setOpenMenu(false)
                  }
                }}
              >
                <FontAwesomeIcon
                  icon={item.icon}
                  className="h-5 w-5 shrink-0"
                />
                <span className="ml-3 whitespace-nowrap text-sm font-medium md:ml-0 md:max-w-0 md:opacity-0 md:transition-all md:duration-300 md:group-hover:ml-3 md:group-hover:max-w-28 md:group-hover:opacity-100">
                  {isLogout && isLoggingOut
                    ? 'Saindo...'
                    : item.name}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
