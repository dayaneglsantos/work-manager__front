'use client'

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { ProfileListItem } from '@/types/profileType'
import { deleteProfile } from '@/services/profileServices'
import Button from './Button'

interface DeleteProfileModalProps {
  profile: ProfileListItem
  onClose: () => void
  onDeleted: () => void
}

export default function DeleteProfileModal({ profile, onClose, onDeleted }: DeleteProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const deletingRef = useRef(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    cancelRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  const close = () => {
    if (!deletingRef.current) onClose()
  }

  const confirm = async () => {
    if (deletingRef.current || profile.fullAccess || profile.userCount > 0) return
    deletingRef.current = true
    setIsDeleting(true)
    setError(null)
    try {
      await deleteProfile(profile.id)
      onDeleted()
    } catch (failure) {
      const status = axios.isAxiosError(failure) ? failure.response?.status : undefined
      if (status === 409) {
        setError('Não é possível excluir este perfil: ele possui usuários vinculados ou é protegido. Feche a janela e atualize a listagem.')
      } else if (status === 403) {
        setError('Você não tem permissão para excluir este perfil.')
      } else if (status === 404) {
        setError('Este perfil não existe mais. Feche a janela e atualize a listagem.')
      } else {
        setError('Não foi possível excluir o perfil. Tente novamente.')
      }
    } finally {
      deletingRef.current = false
      setIsDeleting(false)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-profile-title"
      aria-describedby="delete-profile-description"
      aria-busy={isDeleting}
      onCancel={(event) => { event.preventDefault(); close() }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 text-primary-dark shadow-2xl backdrop:bg-primary-dark/30 backdrop:backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:backdrop:bg-black/50"
    >
      <h2 id="delete-profile-title" className="text-lg font-bold">Excluir perfil</h2>
      <p id="delete-profile-description" className="mt-3 break-words text-sm leading-6 text-gray-600 dark:text-dark-muted">
        Deseja excluir o perfil <strong>{profile.name}</strong>? Suas associações de permissões também serão removidas. Esta ação não pode ser desfeita.
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-error dark:text-red-300">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button ref={cancelRef} type="button" onClick={close} disabled={isDeleting} className="cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 dark:border-dark-border">
          Cancelar
        </button>
        <Button title={isDeleting ? 'Excluindo...' : 'Excluir perfil'} type="button" onClick={confirm} disabled={isDeleting} />
      </div>
    </dialog>
  )
}
