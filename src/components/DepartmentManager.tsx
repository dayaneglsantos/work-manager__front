'use client'

import Image from 'next/image'
import { useState } from 'react'
import defaultAvatar from '@/assets/images/default-avatar.svg'
import { DepartmentDetails } from '@/types/departmentType'
import Badge from './Badge'

export default function DepartmentManager({
  manager
}: {
  manager: DepartmentDetails['manager']
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null)
  return (
    <div className="flex items-center gap-3">
      <Image
        src={
          manager.profileImage && failedImage !== manager.profileImage
            ? manager.profileImage
            : defaultAvatar.src
        }
        unoptimized
        width={48}
        height={48}
        alt={`Foto de ${manager.name}`}
        onError={() => setFailedImage(manager.profileImage)}
        className="h-12 w-12 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-gray-500 dark:text-dark-muted">Gerente</p>
        <p className="break-words font-medium">{manager.name}</p>
        {manager.employmentStatus !== 'active' && (
          <Badge name="Gerente não ativo" variant="error" />
        )}
      </div>
    </div>
  )
}
