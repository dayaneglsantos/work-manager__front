'use client'
import Image from 'next/image'
import logo from '@/assets/images/logo.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars,
  faBullhorn,
  faCheckToSlot,
  faHouse,
  faListCheck,
  faMoneyCheckDollar
} from '@fortawesome/free-solid-svg-icons'
import { faPersonWalkingArrowRight } from '@fortawesome/free-solid-svg-icons/faPersonWalkingArrowRight'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useRef, useState } from 'react'

const menuList = [
  { name: 'Home', icon: faHouse, path: '/' },
  { name: 'Tarefas', icon: faListCheck, path: '/tarefas' },
  { name: 'Comunicados', icon: faBullhorn, path: '/comunicados' },

  {
    name: 'Pagamentos',
    icon: faMoneyCheckDollar,
    path: '/pagamentos'
  },
  { name: 'Ponto', icon: faCheckToSlot, path: '/ponto' },
  { name: 'Sair', icon: faPersonWalkingArrowRight, path: '/logout' }
]

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(false)
  const router = useRouter()
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
      <div className="fixed top-2 left-2 cursor-pointer flex md:hidden h-fit">
        <FontAwesomeIcon
          icon={faBars}
          size="2xl"
          onClick={() => setOpenMenu(!openMenu)}
          className="text-primary"
        />
      </div>
      <div
        className={`flex fixed top-0 left-0 bg-light-background dark:bg-dark-background shadow-lg h-screen ${openMenu ? 'w-48 translate-x-0 shadow-primary-dark dark:shadow-primary' : '-translate-x-full md:translate-x-0'} md:w-16 p-2 md:flex  flex-col items-center z-50 transition-all duration-500 ease-in-out shadow-2xl  md:shadow-primary-dark md:dark:shadow-primary `}
        ref={menuRef}
      >
        <div className="w-full">
          <div
            className="mb-2 cursor-pointer md:hidden flex w-full "
            onClick={() => setOpenMenu(!openMenu)}
          >
            <FontAwesomeIcon
              icon={faBars}
              size="2xl"
              className="text-primary"
            />
          </div>
          <Image
            src={logo}
            alt="Logo"
            className="w-full rounded-full mb-5 mt-4 text-white"
          />
        </div>

        <nav className="flex gap-3 flex-col items-center w-full my-4 grow">
          {menuList.map((item, index) => (
            <span
              className={`group relative flex justify-start w-full h-10 cursor-pointer ${index === menuList.length - 1 ? 'mt-auto' : ''} ${item.name === 'Sair' && isLoggingOut ? 'pointer-events-none opacity-50' : ''}`}
              key={index}
              aria-disabled={item.name === 'Sair' && isLoggingOut}
              onClick={() => {
                if (item.name === 'Sair') {
                  if (isLoggingOut) return
                  void clearSession()
                } else {
                  router.push(item.path)
                }
              }}
            >
              <div className=" bg-primary-light dark:bg-primary flex items-center rounded-full h-10 pl-3 pr-1 transition-all duration-300 w-full md:w-auto">
                <FontAwesomeIcon
                  icon={item.icon}
                  className="w-6 h-6 text-white dark:text-dark-background"
                />
                <span className="ml-2 text-white dark:text-dark-background whitespace-nowrap overflow-hidden grow md:max-w-0 group-hover:max-w-[200px] group-hover:p-2 transition-all duration-300 ease-in-out  overflow-ellipsis">
                  {item.name === 'Sair' && isLoggingOut
                    ? 'Saindo...'
                    : item.name}
                </span>
              </div>
            </span>
          ))}
        </nav>
      </div>
    </>
  )
}
