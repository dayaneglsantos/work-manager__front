'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import Link from 'next/link'

export type ButtonVariant = 'primary' | 'secondary' | 'outline'

interface ButtonProps {
  title: string
  onClick?: () => void
  icon?: IconProp
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: ButtonVariant
  disabled?: boolean
  href?: string
  type?: 'button' | 'submit' | 'reset'
}

const Button = ({
  title,
  onClick,
  icon,
  className,
  size = 'md',
  variant = 'primary',
  disabled = false,
  href,
  type
}: ButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary: 'border-primary bg-primary text-white',
    secondary:
      'border-secondary bg-secondary text-primary-dark',
    outline:
      'border-primary-light/50 bg-primary-light/10 text-primary-dark dark:border-primary-light/30 dark:text-purple-200'
  }

  const interactions: Record<ButtonVariant, string> = {
    primary: 'hover:border-primary-hover hover:bg-primary-hover',
    secondary:
      'hover:border-secondary-dark hover:bg-secondary-dark hover:text-white',
    outline: 'hover:border-primary hover:bg-primary/10'
  }

  const sizes = {
    sm: 'min-h-8 px-3 py-1.5 text-xs',
    md: 'min-h-10 px-4 py-2 text-sm',
    lg: 'min-h-12 px-5 py-2.5 text-base'
  }

  const buttonClassName = `inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed opacity-50' : `cursor-pointer ${interactions[variant]}`} ${className ?? ''}`

  const content = (
    <>
      <span>{title}</span>
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="h-[1em] w-[1em]"
        />
      )}
    </>
  )

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={buttonClassName}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  )
}

export default Button
