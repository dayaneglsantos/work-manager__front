'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { faPen, faTrash, faUsers } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useAuth } from '@/contexts/AuthContext'
import { listDepartments } from '@/services/departmentServices'
import { DepartmentDetails } from '@/types/departmentType'
import Breadcrumb from '@/components/Breadcrumb'
import ActionMenu from '@/components/ActionMenu'
import Button from '@/components/Button'
import DepartmentManager from '@/components/DepartmentManager'
import DepartmentModal from '@/components/DepartmentModal'

export default function DepartmentsPage() {
  const { session, loading } = useAuth()
  const allowed = (name: string) =>
    session?.permissions.some((p) => p.name === name && p.hasPermission) ??
    false
  const canRead = allowed('read-departments')
  const canEdit = allowed('update-departments')
  const canDelete = allowed('delete-departments')
  const [departments, setDepartments] = useState<DepartmentDetails[]>([])
  const [pending, setPending] = useState(true)
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)
  const [modal, setModal] = useState<{
    id: number
    mode: 'edit' | 'delete'
  } | null>(null)

  useEffect(() => {
    if (loading || !canRead) return
    let alive = true
    setPending(true)
    setError('')
    listDepartments()
      .then((data) => {
        if (alive) setDepartments(data)
      })
      .catch((err) => {
        if (alive)
          setError(
            axios.isAxiosError(err) && err.response?.status === 403
              ? 'Você não tem permissão para listar departamentos.'
              : 'Não foi possível carregar os departamentos.'
          )
      })
      .finally(() => {
        if (alive) setPending(false)
      })
    return () => {
      alive = false
    }
  }, [loading, canRead, revision])

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Gestão', href: '/gestao' },
          { label: 'Departamentos' }
        ]}
      />
      <div>
        <h1 className="text-2xl font-bold text-primary-dark dark:text-dark-text">
          Departamentos
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-dark-muted">
          Consulte os departamentos, seus gerentes e a quantidade de
          integrantes.
        </p>
      </div>
      {loading || (canRead && pending) ? (
        <p role="status">Carregando departamentos...</p>
      ) : !canRead ? (
        <p role="alert">Você não tem permissão para listar departamentos.</p>
      ) : error ? (
        <div className="space-y-3">
          <p role="alert">{error}</p>
          <Button
            title="Tentar novamente"
            onClick={() => setRevision((v) => v + 1)}
          />
        </div>
      ) : departments.length === 0 ? (
        <p>Nenhum departamento cadastrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => (
            <article
              key={department.id}
              className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 text-primary-dark shadow-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 break-words text-lg font-semibold">
                  {department.name}
                </h2>
                {(canEdit || canDelete) && (
                  <ActionMenu
                    label={`Opções de ${department.name}`}
                    items={[
                      ...(canEdit
                        ? [
                            {
                              label: 'Editar',
                              icon: faPen,
                              onClick: () =>
                                setModal({
                                  id: department.id,
                                  mode: 'edit' as const
                                })
                            }
                          ]
                        : []),
                      ...(canDelete
                        ? [
                            {
                              label: 'Excluir',
                              icon: faTrash,
                              onClick: () =>
                                setModal({
                                  id: department.id,
                                  mode: 'delete' as const
                                })
                            }
                          ]
                        : [])
                    ]}
                  />
                )}
              </div>
              <DepartmentManager manager={department.manager} />
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                {department._count.users}{' '}
                {department._count.users === 1
                  ? 'usuário vinculado'
                  : 'usuários vinculados'}
              </p>
            </article>
          ))}
        </div>
      )}
      {canRead &&
        modal &&
        ((modal.mode === 'edit' && canEdit) ||
          (modal.mode === 'delete' && canDelete)) && (
          <DepartmentModal
            key={`${modal.id}-${modal.mode}`}
            {...modal}
            canReadUsers={allowed('read-users')}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null)
              setRevision((v) => v + 1)
            }}
          />
        )}
    </div>
  )
}
