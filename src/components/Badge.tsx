import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export type BadgeVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'default'
  | 'error'

interface BadgeProps {
  size?: 'sm' | 'md' | 'lg'
  icon?: IconProp
  variant?: BadgeVariant
  name: string
  fullWidth?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  className?: string
  ref?: React.Ref<HTMLDivElement | HTMLButtonElement>
}

export default function Badge({
  size = 'sm',
  icon,
  variant = 'default',
  name,
  fullWidth = false,
  onClick,
  className,
  ref
}: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    info:
      'border-info/30 bg-info/10 text-info-hover dark:border-info/30 dark:bg-info/15 dark:text-cyan-300',
    success:
      'border-success/30 bg-success/10 text-success dark:border-success/30 dark:bg-success/15 dark:text-green-300',
    warning:
      'border-warning/30 bg-warning/10 text-warning-hover dark:border-warning/30 dark:bg-warning/15 dark:text-orange-300',
    default:
      'border-primary-light/30 bg-primary-light/10 text-primary-dark dark:border-primary-light/20 dark:bg-primary-light/10 dark:text-purple-200',
    error:
      'border-error/30 bg-error/10 text-error dark:border-error/30 dark:bg-error/15 dark:text-red-300'
  }

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <div
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition-colors ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : 'w-fit'} ${className ?? ''}`}
      onClick={onClick}
      ref={ref as any}
    >
      <span>{name}</span>
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="h-[1em] w-[1em] text-current"
        />
      )}
    </div>
  )
}
