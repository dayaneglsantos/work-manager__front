import Image, { StaticImageData } from 'next/image'
import defaultAvatar from '@/assets/images/default-avatar.svg'

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  src: string | null | StaticImageData
  className?: string
}

export default function Avatar({ size = 'md', src, className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-28 h-28'
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className || ''} relative rounded-full overflow-hidden shrink-0`}
    >
      <Image
        src={src || defaultAvatar.src}
        alt="Avatar do usuário"
        className={`object-cover`}
        fill
      />
    </div>
  )
}
