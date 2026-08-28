'use client'

import { faCamera, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'

const MAX_FILE_SIZE = 5_000_000
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ProfileImageFieldProps {
  currentImage?: string | null
  onChange: (file: File | null, removeCurrentImage: boolean) => void
}

export default function ProfileImageField({
  currentImage = null,
  onChange
}: ProfileImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isCurrentImageRemoved, setIsCurrentImageRemoved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const displayedImage =
    previewUrl ?? (isCurrentImageRemoved ? null : currentImage)

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Escolha uma imagem JPG, PNG ou WEBP.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('A imagem deve ter no máximo 5 MB.')
      event.target.value = ''
      return
    }

    setSelectedFile(file)
    setIsCurrentImageRemoved(false)
    setError(null)
    onChange(file, false)
    event.target.value = ''
  }

  const removeImage = () => {
    const shouldRemoveCurrentImage = Boolean(currentImage)

    setSelectedFile(null)
    setIsCurrentImageRemoved(shouldRemoveCurrentImage)
    setError(null)
    onChange(null, shouldRemoveCurrentImage)
  }

  return (
    <div className="md:col-span-2">
      <span className="mb-2 block text-sm font-medium text-primary-dark dark:text-dark-text">
        Imagem de perfil
      </span>

      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-gray-300 p-4 sm:flex-row sm:items-center dark:border-dark-border">
        <Avatar src={displayedImage} size="xl" />

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={selectImage}
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-dark-surface"
            >
              <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
              Escolher imagem
            </button>

            {displayedImage && (
              <button
                type="button"
                onClick={removeImage}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-error transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none dark:hover:bg-error/10"
              >
                <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
                Remover imagem
              </button>
            )}
          </div>

          <p className="mt-2 text-xs text-gray-500 dark:text-dark-muted">
            JPG, PNG ou WEBP. Tamanho máximo de 5 MB.
          </p>

          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-error">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
