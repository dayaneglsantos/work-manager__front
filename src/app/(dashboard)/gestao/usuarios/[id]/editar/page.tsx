'use client'

import Breadcrumb from '@/components/Breadcrumb'
import UserForm from '@/components/UserForm'
import { getUserById, updateUser } from '@/services/userServices'
import { UpdateUserPayload, UserType } from '@/types/userType'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function Page() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const userId = Number(params.id)
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      if (!Number.isInteger(userId) || userId <= 0) {
        setHasError(true)
        setIsLoading(false)
        return
      }

      try {
        const data = await getUserById(userId)

        if (isMounted) {
          setUser(data)
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
  }, [userId])

  const handleUpdateUser = async (payload: UpdateUserPayload) => {
    try {
      await updateUser(userId, payload)
      toast.success('Usuário atualizado com sucesso')
      router.push('/gestao/usuarios')
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível atualizar o usuário')
    }
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
      ) : (
        <UserForm
          mode="edit"
          initialUser={user}
          onSubmit={handleUpdateUser}
        />
      )}
    </section>
  )
}
