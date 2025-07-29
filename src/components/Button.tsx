'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

interface ButtonProps {
  title: string
  onClick?: () => void
  icon?: IconProp
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const Button = ({
  title,
  onClick,
  icon,
  className,
  size = 'md'
}: ButtonProps) => {
  return (
    <button
      className={`bg-primary cursor-pointer rounded-full p-2 hover:bg-primary-hover transition ease-in-out duration-300 text-white ${size === 'sm' ? 'text-[12px]' : size === 'md' ? 'text-sm' : 'text-[16px]'} ${className}`}
      onClick={onClick}
    >
      {title}
      {icon && <FontAwesomeIcon icon={icon} className="ml-2" />}
    </button>
  )
}

export default Button
