'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { ProfileType } from '@/types/profileType'
import { createProfile, updateProfile } from '@/services/profileServices'
import Button from './Button'
import FormField from './FormField'

const schema = z.object({ name: z.string().trim().min(1, 'Informe o nome do perfil.') })
type ProfileForm = z.infer<typeof schema>

interface ProfileModalProps {
  profile: ProfileType | null
  onClose: () => void
  onSaved: (profile: ProfileType) => void
}

// Montado somente enquanto aberto; cada abertura começa com um formulário novo.
export default function ProfileModal({ profile, onClose, onSaved }: ProfileModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const savingRef = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, setError: setFieldError, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile?.name ?? '' }
  })

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    dialog?.querySelector('input')?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  const close = () => {
    if (!savingRef.current) onClose()
  }

  const save = async ({ name }: ProfileForm) => {
    if (savingRef.current) return
    savingRef.current = true
    setError(null)
    try {
      const saved = profile
        ? await updateProfile(profile.id, name)
        : await createProfile(name)
      onSaved(saved)
    } catch (failure) {
      if (axios.isAxiosError(failure)) {
        const status = failure.response?.status
        const message = failure.response?.data?.error
        if (status === 409 && message === 'There is already a registered profile with this name.') {
          setFieldError('name', { message: 'Já existe um perfil com esse nome.' }, { shouldFocus: true })
        } else if (status === 409) {
          setError('Este perfil é protegido e não pode ser alterado.')
        } else if (status === 403) {
          setError('Você não tem permissão para salvar este perfil.')
        } else if (status === 404) {
          setError('Este perfil não existe mais. Feche a janela e atualize a listagem.')
        } else {
          setError('Não foi possível salvar o perfil. Tente novamente.')
        }
      } else {
        setError('Não foi possível salvar o perfil. Tente novamente.')
      }
    } finally {
      savingRef.current = false
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="profile-modal-title"
      aria-describedby="profile-modal-description"
      onCancel={(event) => { event.preventDefault(); close() }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 text-primary-dark shadow-2xl backdrop:bg-primary-dark/30 backdrop:backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:backdrop:bg-black/50"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="profile-modal-title" className="text-lg font-bold">
            {profile ? 'Editar perfil' : 'Cadastrar perfil'}
          </h2>
          <p id="profile-modal-description" className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
            {profile ? 'Atualize o nome deste perfil.' : 'Informe o nome. As permissões serão configuradas separadamente.'}
          </p>
        </div>
        <button type="button" onClick={close} disabled={isSubmitting} aria-label="Fechar" className="rounded-lg px-2 text-xl focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">
          ×
        </button>
      </header>
      <form onSubmit={handleSubmit(save)} noValidate aria-busy={isSubmitting} className="mt-6">
        <FormField label="Nome do perfil" id="profile-name" required disabled={isSubmitting} error={errors.name?.message} {...register('name')} />
        {error && <p role="alert" className="mt-3 text-sm text-error dark:text-red-300">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5 dark:border-dark-border">
          <Button title="Cancelar" type="button" variant="outline" onClick={close} disabled={isSubmitting} />
          <Button title={isSubmitting ? 'Salvando...' : profile ? 'Salvar alterações' : 'Cadastrar perfil'} type="submit" disabled={isSubmitting} />
        </div>
      </form>
    </dialog>
  )
}
