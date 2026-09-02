'use client'

import Breadcrumb from '@/components/Breadcrumb'
import UserForm from '@/components/UserForm'
import {
  getSelfProfile,
  getUserById,
  removeProfileImage,
  updateSelfProfile,
  updateUser,
  uploadProfileImage
} from '@/services/userServices'
import {
  ProfileImageChange,
  SelfProfilePayload,
  SelfProfileType,
  UpdateUserPayload,
  UserType
} from '@/types/userType'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function Page() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { session, loading: sessionLoading, saveSession } = useAuth()
  const userId = Number(params.id)
  const [user, setUser] = useState<UserType | SelfProfileType | null>(null)
  const [editMode, setEditMode] = useState<'edit' | 'self-edit'>('edit')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (sessionLoading) return

      if (!Number.isInteger(userId) || userId <= 0) {
        setHasError(true)
        setIsLoading(false)
        return
      }

      try {
        const canManageUsers = Boolean(
          session?.permissions.some(
            (permission) =>
              permission.name === 'update-users' && permission.hasPermission
          )
        )
        const isEditingSelf = session?.id === userId

        if (!isEditingSelf && !canManageUsers) {
          throw new Error('User is not allowed to edit another user')
        }

        let data: UserType | SelfProfileType
        let mode: 'edit' | 'self-edit'

        if (isEditingSelf) {
          const selfProfile = await getSelfProfile()

          if (!canManageUsers || selfProfile.isSystemOwner) {
            data = selfProfile
            mode = 'self-edit'
          } else {
            data = await getUserById(userId)
            mode = 'edit'
          }
        } else {
          data = await getUserById(userId)
          mode = 'edit'
        }

        if (isMounted) {
          setUser(data)
          setEditMode(mode)
        }
      } catch (error) {
        console.error(error)

        if (isMounted) {
          setHasError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [session, sessionLoading, userId])

  const applyProfileImage = async (profileImage: ProfileImageChange) => {
    if (profileImage.file) {
      return uploadProfileImage(userId, profileImage.file)
    }

    if (profileImage.removeCurrentImage) {
      return removeProfileImage(userId)
    }

    return null
  }

  const handleUpdateSelf = async (
    payload: SelfProfilePayload,
    profileImage: ProfileImageChange
  ) => {
    let updatedProfile: SelfProfileType

    try {
      updatedProfile = await updateSelfProfile(payload)
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível atualizar seus dados')
      return
    }

    let updatedAvatar = updatedProfile.profileImage ?? null

    try {
      const imageResult = await applyProfileImage(profileImage)
      if (imageResult) updatedAvatar = imageResult.profileImage
    } catch (error) {
      console.error(error)
      toast.error(
        'Dados atualizados, mas não foi possível alterar a imagem de perfil'
      )
      if (session) {
        saveSession({ ...session, name: updatedProfile.name })
      }
      router.push('/')
      return
    }

    if (session) {
      saveSession({
        ...session,
        name: updatedProfile.name,
        profileImage: updatedAvatar
      })
    }

    toast.success('Seus dados foram atualizados com sucesso')
    router.push('/')
  }

  const handleUpdateUser = async (
    payload: UpdateUserPayload,
    profileImage: ProfileImageChange
  ) => {
    try {
      await updateUser(userId, payload)
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível atualizar o usuário')
      return
    }

    try {
      await applyProfileImage(profileImage)
    } catch (error) {
      console.error(error)
      toast.error(
        'Dados atualizados, mas não foi possível alterar a imagem de perfil'
      )
      router.push('/gestao/usuarios')
      return
    }

    toast.success('Usuário atualizado com sucesso')
    router.push('/gestao/usuarios')
  }

  return (
    <section>
      <Breadcrumb
        items={[
          { label: 'Gestão', href: '/gestao' },
          { label: 'Usuários', href: '/gestao/usuarios' },
          { label: 'Editar usuário' }
        ]}
        className="mb-6"
      />

      <header className="mb-8 max-w-2xl">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-primary-light">
          Pessoas
        </span>
        <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
          Editar usuário
        </h1>
        <p className="mt-1 text-base leading-7 text-gray-600 dark:text-dark-muted">
          Atualize os dados do colaborador e salve as alterações.
        </p>
      </header>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500 dark:border-dark-border dark:text-dark-muted">
          Carregando usuário...
        </div>
      ) : hasError || !user ? (
        <div className="rounded-2xl border border-error/20 bg-error/5 px-6 py-12 text-center text-sm text-error dark:text-red-300">
          Não foi possível carregar os dados do usuário.
        </div>
      ) : editMode === 'self-edit' ? (
        <UserForm
          mode="self-edit"
          initialUser={user as SelfProfileType}
          onSubmit={handleUpdateSelf}
        />
      ) : (
        <UserForm
          mode="edit"
          initialUser={user as UserType}
          onSubmit={handleUpdateUser}
        />
      )}
    </section>
  )
}
