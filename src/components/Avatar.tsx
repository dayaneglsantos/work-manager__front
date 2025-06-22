import Image, { StaticImageData } from 'next/image'
import defaultAvatar from '@/assets/images/default-avatar.png'

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg'
  src: string | null | StaticImageData
  className?: string
}

export default function Avatar({ size = 'md', src, className }: AvatarProps) {
  return (
    <Image
      src={src || defaultAvatar.src}
      alt="Avatar"
      className={`rounded-full ${className ?? ''}`}
      width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
      height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
    />
  )
}
