import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface BadgeProps {
  size?: 'sm' | 'md' | 'lg'
  icon?: IconProp
  color?: 'info' | 'success' | 'warning' | 'default' | 'error'
  name: string
  fullWidth?: boolean
}

export default function Badge({
  size = 'sm',
  icon,
  color = 'warning',
  name,
  fullWidth = false
}: BadgeProps) {
  const colors = {
    info: 'bg-info',
    success: 'bg-success',
    warning: 'bg-warning',
    default: 'bg-neutral-400',
    error: 'bg-error'
  }

  return (
    <div
      className={`flex items-center gap-1 ${colors[color] ?? colors.default} rounded-3xl p-1 px-2 text-${size} text-white dark:text-black justify-center ${fullWidth ? 'w-full' : 'w-fit'}`}
    >
      <span>{name}</span>
      {icon && (
        <FontAwesomeIcon icon={icon} className="text-white dark:text-black" />
      )}
    </div>
  )
}
