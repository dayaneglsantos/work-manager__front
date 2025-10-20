import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

interface DropdownProps {
  title: string
  children: React.ReactNode
  className?: string
}

export default function Dropdown({
  title,
  children,
  className
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleDropdown = ({}) => {
    setIsOpen(!isOpen)
  }

  return (
    <div className={className}>
      <div
        className="flex justify-between py-1 px-2 items-center cursor-pointer bg-primary-dark/45 rounded"
        onClick={toggleDropdown}
      >
        <span>{title}</span>
        <FontAwesomeIcon
          icon={isOpen ? faCaretUp : faCaretDown}
          className="text-white"
        />
      </div>
      <div className="transition-all duration-300 ease-in-out overflow-hidden ">
        {isOpen && <div className="py-2 px-4">{children}</div>}
      </div>
    </div>
  )
}
