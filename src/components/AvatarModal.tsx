'use client'

import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCamera, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import Avatar from './Avatar'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface AvatarModalProps {
  open: boolean
  currentAvatar: string | null
  onClose: () => void
  onApply: (avatar: string | null) => void
}

export default function AvatarModal({
  open,
  currentAvatar,
  onClose,
  onApply
}: AvatarModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentAvatar)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    setPreview(currentAvatar)
    setError(null)

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [currentAvatar, onClose, open])

  if (!open) return null

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

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setPreview(null)
    setError(null)

    if (inputRef.current) inputRef.current.value = ''
  }

  const applyAvatar = () => {
    onApply(preview)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary-dark/30 p-4 backdrop-blur-sm dark:bg-black/50"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-modal-title"
        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl shadow-primary-dark/15 dark:border-dark-border dark:bg-dark-surface dark:shadow-black/30"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="avatar-modal-title"
              className="text-lg font-bold text-primary-dark dark:text-dark-text"
            >
              Alterar avatar
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
              Escolha uma imagem que represente você.
            </p>
          </div>

          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none dark:text-dark-muted dark:hover:bg-dark-surface-hover dark:hover:text-dark-text"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </header>

        <div className="mt-7 flex flex-col items-center text-center">
          <div className="rounded-full bg-gradient-to-br from-primary-light to-primary p-1 shadow-lg shadow-primary/20">
            <Avatar src={preview} size="xl" />
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={selectImage}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-5 flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-dark-surface"
          >
            <FontAwesomeIcon icon={faCamera} className="h-4 w-4" />
            Escolher imagem
          </button>

          <p className="mt-3 text-xs text-gray-500 dark:text-dark-muted">
            JPG, PNG ou WEBP. Tamanho máximo de 5 MB.
          </p>

          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-error">
              {error}
            </p>
          )}

          {preview && (
            <button
              type="button"
              onClick={removeImage}
              className="mt-4 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-error transition-colors hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-error focus-visible:outline-none dark:hover:bg-error/10"
            >
              <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
              Remover imagem
            </button>
          )}
        </div>

        <div className="mt-7 flex justify-end gap-3 border-t border-gray-100 pt-5 dark:border-dark-border">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none dark:text-dark-muted dark:hover:bg-dark-surface-hover"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={applyAvatar}
            className="cursor-pointer rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-dark-surface"
          >
            Aplicar avatar
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-gray-400 dark:text-dark-muted">
          Nesta etapa, a alteração será mantida somente até a página ser
          recarregada.
        </p>
      </section>
    </div>
  )
}
