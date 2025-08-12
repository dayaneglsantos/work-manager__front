import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface BadgeProps {
  size?: 'sm' | 'md' | 'lg'
  icon?: IconProp
  color?: 'info' | 'success' | 'warning' | 'default' | 'error'
  name: string
  fullWidth?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  className?: string
}

export default function Badge({
  size = 'sm',
  icon,
  color = 'default',
  name,
  fullWidth = false,
  onClick,
  className
}: BadgeProps) {
  const colors = {
    info: 'bg-info hover:bg-info-hover',
    success: 'bg-success hover:bg-success-hover',
    warning: 'bg-warning hover:bg-warning-hover',
    default: 'bg-neutral-400 hover:bg-neutral-500',
    error: 'bg-error hover:bg-error-hover'
  }

  return (
    <div
      className={`flex items-center gap-1 ${colors[color] ?? colors.default} rounded-3xl p-1 px-2 text-${size} text-white justify-center ${fullWidth ? 'w-full' : 'w-fit'} ${className ?? ''}`}
      onClick={onClick}
    >
      <span>{name}</span>
      {icon && (
        <FontAwesomeIcon icon={icon} className="text-white dark:text-black" />
      )}
    </div>
  )
}
