import Image from 'next/image'
import logo from '@/assets/images/logo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBullhorn,
  faCheckToSlot,
  faHouse,
  faListCheck,
  faMoneyCheckDollar
} from '@fortawesome/free-solid-svg-icons'
import { faPersonWalkingArrowRight } from '@fortawesome/free-solid-svg-icons/faPersonWalkingArrowRight'
import Link from 'next/link'

const menuList = [
  { name: 'Home', icon: faHouse, path: '/' },
  { name: 'Tarefas', icon: faListCheck, path: '/tarefas' },
  { name: 'Comunicados', icon: faBullhorn, path: '/comunicados' },

  { name: 'Pagamentos', icon: faMoneyCheckDollar, path: '/pagamentos' },
  { name: 'Ponto', icon: faCheckToSlot, path: '/ponto' },
  { name: 'Sair', icon: faPersonWalkingArrowRight, path: '/logout' }
]

export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 bg-primary-dark dark:bg-primary h-screen w-16 p-2  flex flex-col items-center">
      <Image src={logo} alt="Logo" className="w-12 h-12 rounded-full mb-4" />

      <nav className="flex gap-3 flex-col items-center w-full mt-4">
        {menuList.map((item, index) => (
          <Link
            className="group relative flex justify-start w-full h-10 cursor-pointer"
            key={index}
            href={item.path}
          >
            <div className=" bg-primary-light dark:bg-white flex items-center rounded-full h-10 pl-3 pr-1 transition-all duration-300">
              <FontAwesomeIcon
                icon={item.icon}
                className="w-6 h-6 text-white dark:text-primary"
              />
              <span className="ml-2 text-white dark:text-primary whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[200px] group-hover:p-2 transition-all duration-300 ease-in-out">
                {item.name}
              </span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  )
}
