'use client'

import Button from '@/components/Button'
import SelectField from '@/components/SelectField'
import {
  getProfilePermissions,
  getUserPermissions,
  updateProfilePermissions,
  updateUserPermissions
} from '@/services/permissionServices'
import { getProfiles } from '@/services/profileServices'
import {
  ProfilePermission,
  ProfilePermissionList,
  UserPermission,
  UserPermissionList
} from '@/types/permissionType'
import { ProfileType } from '@/types/profileType'
import {
  faCheck,
  faExclamation,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

type PermissionEditorProps =
  | { mode: 'profile' }
  | { mode: 'user'; userId: number }

const typeLabels: Record<string, string> = {
  users: 'Usuários',
  profiles: 'Perfis',
  departments: 'Departamentos',
  permissions: 'Permissões',
  tasks: 'Tarefas'
}

const actionLabels: Record<string, string> = {
  create: 'Criar',
  read: 'Visualizar',
  update: 'Editar',
  delete: 'Excluir'
}

const groupPermissions = <T extends { type: string }>(permissions: T[]) =>
  permissions.reduce<Record<string, T[]>>((groups, permission) => {
    groups[permission.type] = [...(groups[permission.type] ?? []), permission]
    return groups
  }, {})

export default function PermissionEditor(props: PermissionEditorProps) {
  const userId = props.mode === 'user' ? props.userId : null
  const [profiles, setProfiles] = useState<ProfileType[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  )
  const [profileData, setProfileData] = useState<ProfilePermissionList | null>(
    null
  )
  const [userData, setUserData] = useState<UserPermissionList | null>(null)
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(
    props.mode === 'profile'
  )
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(
    props.mode === 'user'
  )
  const [hasProfilesError, setHasProfilesError] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const loadProfiles = useCallback(async () => {
    setIsLoadingProfiles(true)
    setHasProfilesError(false)
    try {
      setProfiles(await getProfiles())
    } catch (error) {
      console.error(error)
      setHasProfilesError(true)
    } finally {
      setIsLoadingProfiles(false)
    }
  }, [])

  useEffect(() => {
    if (props.mode === 'profile') void loadProfiles()
  }, [loadProfiles, props.mode])

  const loadUserPermissions = useCallback(async () => {
    if (userId === null) return

    if (!Number.isInteger(userId) || userId <= 0) {
      setHasError(true)
      setIsLoadingPermissions(false)
      return
    }

    setIsLoadingPermissions(true)
    setHasError(false)
    try {
      setUserData(await getUserPermissions(userId))
      setIsDirty(false)
    } catch (error) {
      console.error(error)
      setHasError(true)
    } finally {
      setIsLoadingPermissions(false)
    }
  }, [userId])

  useEffect(() => {
    if (props.mode === 'user') void loadUserPermissions()
  }, [loadUserPermissions, props.mode])

  const selectProfile = async (profileId: number) => {
    setSelectedProfileId(profileId)
    setProfileData(null)
    setIsDirty(false)
    setIsLoadingPermissions(true)
    setHasError(false)

    try {
      setProfileData(await getProfilePermissions(profileId))
    } catch (error) {
      console.error(error)
      setHasError(true)
    } finally {
      setIsLoadingPermissions(false)
    }
  }

  const permissions: Array<ProfilePermission | UserPermission> =
    profileData?.permissions ?? userData?.permissions ?? []
  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions]
  )

  const changeProfilePermission = (permissionId: number, checked: boolean) => {
    setProfileData((current) =>
      current
        ? {
            ...current,
            permissions: current.permissions.map((permission) =>
              permission.permissionId === permissionId
                ? { ...permission, hasPermission: checked }
                : permission
            )
          }
        : current
    )
    setIsDirty(true)
  }

  const changeUserPermission = (
    permissionId: number,
    customValue: boolean | null
  ) => {
    setUserData((current) =>
      current
        ? {
            ...current,
            permissions: current.permissions.map((permission) =>
              permission.permissionId === permissionId
                ? {
                    ...permission,
                    customValue,
                    effectiveValue: customValue ?? permission.profileValue
                  }
                : permission
            )
          }
        : current
    )
    setIsDirty(true)
  }

  const savePermissions = async () => {
    setIsSaving(true)
    try {
      if (props.mode === 'profile' && profileData) {
        const updated = await updateProfilePermissions(
          profileData.profile.id,
          profileData.permissions.map(({ permissionId, hasPermission }) => ({
            permissionId,
            hasPermission
          }))
        )
        setProfileData(updated)
      } else if (props.mode === 'user' && userData) {
        const updated = await updateUserPermissions(
          props.userId,
          userData.permissions.map(({ permissionId, customValue }) => ({
            permissionId,
            customValue
          }))
        )
        setUserData(updated)
      }
      setIsDirty(false)
      toast.success('Permissões salvas com sucesso')
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível salvar as permissões')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoadingProfiles) return <LoadingState message="Carregando perfis..." />

  return (
    <div className="mt-8">
      {props.mode === 'profile' && (
        <div className="max-w-md">
          <label className="mb-2 block text-sm font-semibold text-primary-dark dark:text-dark-text">
            Perfil
          </label>
          <SelectField
            options={profiles.map((profile) => ({
              label: profile.name,
              value: profile.id
            }))}
            value={selectedProfileId ?? undefined}
            onChange={(value) => {
              if (typeof value === 'number') void selectProfile(value)
            }}
            placeholder="Selecione um perfil"
          />
        </div>
      )}

      {props.mode === 'profile' && hasProfilesError ? (
        <ErrorState onRetry={() => void loadProfiles()} />
      ) : props.mode === 'profile' && !selectedProfileId ? (
        <EmptySelection />
      ) : isLoadingPermissions ? (
        <LoadingState message="Carregando permissões..." />
      ) : hasError || (props.mode === 'profile' ? !profileData : !userData) ? (
        <ErrorState
          onRetry={() => {
            if (props.mode === 'user') void loadUserPermissions()
            else if (selectedProfileId) void selectProfile(selectedProfileId)
          }}
        />
      ) : (
        <>
          <SubjectHighlight
            title={
              props.mode === 'profile'
                ? profileData!.profile.name
                : userData!.user.name
            }
            description={
              props.mode === 'profile'
                ? 'As alterações serão aplicadas a todos os usuários deste perfil.'
                : `Perfil de origem: ${userData!.user.profile.name}`
            }
            kind={props.mode === 'profile' ? 'Perfil selecionado' : 'Usuário'}
          />

          <div className="mt-6 space-y-5">
            {Object.entries(groupedPermissions).map(
              ([type, typePermissions]) => (
                <PermissionGroup
                  key={type}
                  title={typeLabels[type] ?? type}
                  permissions={typePermissions}
                  mode={props.mode}
                  onProfileChange={changeProfilePermission}
                  onUserChange={changeUserPermission}
                />
              )
            )}
          </div>

          {props.mode === 'user' && <CustomPermissionLegend />}

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-dark-border">
            <Button
              title={isSaving ? 'Salvando...' : 'Salvar permissões'}
              icon={faCheck}
              disabled={!isDirty || isSaving}
              onClick={() => void savePermissions()}
              className="w-full sm:w-auto"
            />
          </div>
        </>
      )}
    </div>
  )
}

function PermissionGroup({
  title,
  permissions,
  mode,
  onProfileChange,
  onUserChange
}: {
  title: string
  permissions: Array<ProfilePermission | UserPermission>
  mode: 'profile' | 'user'
  onProfileChange: (permissionId: number, checked: boolean) => void
  onUserChange: (permissionId: number, customValue: boolean | null) => void
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-dark-border dark:bg-dark-surface">
      <header className="border-b border-purple-100 bg-purple-50/70 px-5 py-4 dark:border-dark-border dark:bg-primary/10">
        <h2 className="font-bold text-primary-dark dark:text-dark-text">
          {title}
        </h2>
      </header>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {permissions.map((permission) => {
          const isUserPermission = 'customValue' in permission
          const isCustom = isUserPermission && permission.customValue !== null

          return (
            <div
              key={permission.permissionId}
              className={`rounded-xl border p-4 transition-colors ${
                isCustom
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10'
                  : 'border-gray-200 bg-gray-50/60 dark:border-dark-border dark:bg-dark-background/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-primary-dark dark:text-dark-text">
                    {actionLabels[permission.action] ?? permission.action}
                  </p>
                </div>
                {isCustom && (
                  <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
                    Personalizada
                  </span>
                )}
              </div>

              {mode === 'profile' && 'hasPermission' in permission ? (
                <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                  <input
                    type="checkbox"
                    checked={permission.hasPermission}
                    onChange={(event) =>
                      onProfileChange(
                        permission.permissionId,
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 cursor-pointer accent-primary"
                  />
                  Permitir ação
                </label>
              ) : isUserPermission ? (
                <div className="mt-2">
                  <p className="mb-2 text-xs text-gray-500 dark:text-dark-muted">
                    No perfil:{' '}
                    {permission.profileValue ? 'Permitida' : 'Negada'}
                  </p>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-dark-text">
                    <input
                      type="checkbox"
                      checked={permission.effectiveValue}
                      onChange={(event) => {
                        const checked = event.target.checked
                        onUserChange(
                          permission.permissionId,
                          checked === permission.profileValue ? null : checked
                        )
                      }}
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                    Permitir ação
                  </label>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SubjectHighlight({
  title,
  description,
  kind
}: {
  title: string
  description: string
  kind: string
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-purple-50 to-white p-5 dark:from-primary/20 dark:via-dark-surface dark:to-dark-surface">
      <p className="text-xs font-bold tracking-wider text-primary uppercase dark:text-primary-light">
        {kind}
      </p>
      <h2 className="mt-1 text-xl font-bold text-primary-dark dark:text-dark-text">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
        {description}
      </p>
    </div>
  )
}

function EmptySelection() {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-white px-6 py-16 text-center dark:border-primary-light/30 dark:bg-dark-surface">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl text-primary">
        🔐
      </div>
      <h2 className="mt-4 font-semibold text-primary-dark dark:text-dark-text">
        Selecione um perfil
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-dark-muted">
        Escolha um perfil acima para consultar e configurar suas permissões.
      </p>
    </div>
  )
}

function LoadingState({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500 dark:border-dark-border dark:text-dark-muted">
      {message}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mt-6 rounded-2xl border border-error/20 bg-error/5 px-6 py-12 text-center text-sm text-error dark:text-red-300">
      <p>Não foi possível carregar as permissões.</p>
      <Button
        title="Tentar novamente"
        icon={faRotateRight}
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-4"
      />
    </div>
  )
}

function CustomPermissionLegend() {
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-gray-600 dark:bg-primary/10 dark:text-dark-muted">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary dark:bg-primary dark:text-white">
        <FontAwesomeIcon icon={faExclamation} className="h-full" />
      </div>
      <p>
        Itens destacados como <strong>Personalizada</strong> possuem uma regra
        própria para este usuário e não herdam o valor definido no perfil.
      </p>
    </div>
  )
}
