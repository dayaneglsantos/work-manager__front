'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

interface ButtonProps {
  title: string
  onClick?: () => void
  icon?: IconProp
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const Button = ({
  title,
  onClick,
  icon,
  className,
  size = 'md',
  disabled
}: ButtonProps) => {
  return (
    <button
      className={`bg-primary  rounded-full p-2  transition ease-in-out duration-300 text-white ${size === 'sm' ? 'text-[12px]' : size === 'md' ? 'text-sm' : 'text-[16px]'} ${className} ${disabled ? 'opacity-50 cursor-default' : 'cursor-pointer hover:bg-primary-hover'}`}
      onClick={onClick}
      disabled={disabled}
    >
      {title}
      {icon && <FontAwesomeIcon icon={icon} className="ml-2" />}
    </button>
  )
}

export default Button
