import Image, { StaticImageData } from 'next/image'
import defaultAvatar from '@/assets/images/default-avatar.png'

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg'
  src: string | null | StaticImageData
  className?: string
}

export default function Avatar({ size = 'md', src, className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className || ''} relative rounded-full overflow-hidden`}
    >
      <Image
        src={src || defaultAvatar.src}
        alt="Avatar"
        className={`object-cover`}
        fill
      />
    </div>
  )
}
