'use client'

import Breadcrumb from '@/components/Breadcrumb'
import Button from '@/components/Button'
import ProfileCard from '@/components/ProfileCard'
import ProfileModal from '@/components/ProfileModal'
import DeleteProfileModal from '@/components/DeleteProfileModal'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { getProfiles } from '@/services/profileServices'
import { ProfileListItem, ProfileType } from '@/types/profileType'
import axios from 'axios'
import { useEffect, useState } from 'react'

export default function Page() {
  const { session, loading: isSessionLoading } = useAuth()
  const [profiles, setProfiles] = useState<ProfileListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isForbidden, setIsForbidden] = useState(false)
  const [retry, setRetry] = useState(0)
  const [profileToDelete, setProfileToDelete] = useState<ProfileListItem | null>(null)
  const canDelete = session?.permissions.some(
    (permission) => permission.name === 'delete-profiles' && permission.hasPermission
  ) ?? false
  const [modal, setModal] = useState<{ profile: ProfileType | null } | null>(
    null
  )
  const canCreate =
    session?.permissions.some(
      (permission) =>
        permission.name === 'create-profiles' && permission.hasPermission
    ) ?? false
  const canUpdate =
    session?.permissions.some(
      (permission) =>
        permission.name === 'update-profiles' && permission.hasPermission
    ) ?? false
  const canRead =
    session?.permissions.some(
      (permission) =>
        permission.name === 'read-profiles' && permission.hasPermission
    ) ?? false

  useEffect(() => {
    if (isSessionLoading || !canRead) return

    let isMounted = true

    const loadProfiles = async () => {
      setIsLoading(true)
      setHasError(false)
      setIsForbidden(false)

      try {
        const data = await getProfiles()
        if (isMounted) setProfiles(data)
      } catch (error) {
        if (!isMounted) return
        setProfiles([])
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setIsForbidden(true)
        } else {
          setHasError(true)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    void loadProfiles()

    return () => {
      isMounted = false
    }
  }, [canRead, isSessionLoading, retry])

  return (
    <section>
      <Breadcrumb
        items={[{ label: 'Gestão', href: '/gestao' }, { label: 'Perfis' }]}
        className="mb-6"
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <span className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-primary-light">
            Acessos
          </span>
          <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
            Perfis
          </h1>
          <p className="mt-1 text-base leading-7 text-gray-600 dark:text-dark-muted">
            Consulte os perfis que organizam os acessos dos usuários no sistema.
          </p>
        </div>

        {!isSessionLoading && canRead && !isForbidden && canCreate && (
          <Button
            title="Cadastrar perfil"
            onClick={() => setModal({ profile: null })}
            className="w-full shrink-0 sm:w-auto"
          />
        )}
      </header>

      <div className="mt-8">
        {isSessionLoading ? (
          <p
            role="status"
            className="py-12 text-center text-sm text-gray-500 dark:text-dark-muted"
          >
            Carregando sessão...
          </p>
        ) : !canRead || isForbidden ? (
          <div
            role="alert"
            className="rounded-2xl border border-warning/30 bg-warning/5 px-6 py-12 text-center text-sm text-primary-dark dark:text-dark-text"
          >
            Você não tem permissão para consultar os perfis.
          </div>
        ) : isLoading ? (
          <p
            role="status"
            className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500 dark:border-dark-border dark:text-dark-muted"
          >
            Carregando perfis...
          </p>
        ) : hasError ? (
          <div
            role="alert"
            className="rounded-2xl border border-error/20 bg-error/5 px-6 py-12 text-center"
          >
            <p className="mb-4 text-sm text-error dark:text-red-300">
              Não foi possível carregar os perfis.
            </p>
            <Button
              title="Tentar novamente"
              variant="outline"
              onClick={() => setRetry((current) => current + 1)}
            />
          </div>
        ) : profiles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-dark-border">
            <h2 className="font-semibold text-primary-dark dark:text-dark-text">
              Nenhum perfil cadastrado
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-muted">
              Os perfis cadastrados serão exibidos aqui.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500 dark:text-dark-muted">
              {profiles.length}{' '}
              {profiles.length === 1
                ? 'perfil encontrado'
                : 'perfis encontrados'}
            </p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-4">
              {profiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onEdit={canUpdate ? () => setModal({ profile }) : undefined}
                  onDelete={canDelete ? () => setProfileToDelete(profile) : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {profileToDelete && canRead && canDelete && (
        <DeleteProfileModal
          profile={profileToDelete}
          onClose={() => setProfileToDelete(null)}
          onDeleted={() => {
            toast.success('Perfil excluído com sucesso')
            setProfileToDelete(null)
            setRetry((current) => current + 1)
          }}
        />
      )}
      {modal && canRead && (modal.profile ? canUpdate : canCreate) && (
        <ProfileModal
          profile={modal.profile}
          onClose={() => setModal(null)}
          onSaved={() => {
            toast.success(
              modal.profile
                ? 'Perfil atualizado com sucesso'
                : 'Perfil cadastrado com sucesso'
            )
            setModal(null)
            setRetry((current) => current + 1)
          }}
        />
      )}
    </section>
  )
}
