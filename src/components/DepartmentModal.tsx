'use client'

import { useEffect, useId, useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartmentManagers,
  updateDepartment
} from '@/services/departmentServices'
import { DepartmentDetails } from '@/types/departmentType'
import DepartmentManager from './DepartmentManager'
import AsyncSearchSelect, { AsyncSearchPage } from './AsyncSearchSelect'
import Button from './Button'

type Manager = DepartmentDetails['manager']
type Props = {
  id?: number
  mode: 'create' | 'edit' | 'delete'
  onClose: () => void
  onSaved: () => void
}

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-transparent p-3 focus-visible:outline-2 focus-visible:outline-primary dark:border-dark-border'

const loadManagers = async (
  search: string,
  page: number
): Promise<AsyncSearchPage<Manager>> => {
  const result = await listDepartmentManagers(search, page)
  return {
    options: result.data.map((user) => ({
      id: user.id,
      name: user.name,
      employmentStatus: user.employmentStatus,
      profileImage: user.profileImage ?? null
    })),
    hasNextPage: result.meta.hasNextPage
  }
}

const managerKey = (manager: Manager) => manager.id
const managerLabel = (manager: Manager) => manager.name

export default function DepartmentModal({ id, mode, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const busy = useRef(false)
  const titleId = useId()
  const isCreate = mode === 'create'
  const isForm = mode !== 'delete'
  const [department, setDepartment] = useState<DepartmentDetails | null>(null)
  const [loading, setLoading] = useState(!isCreate)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [manager, setManager] = useState<Manager | null>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    const element = dialog.current
    element?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      element?.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus()
    }
  }, [])

  useEffect(() => {
    if (isCreate || id === undefined) return
    let alive = true
    setLoading(true)
    setLoadError('')
    getDepartment(id)
      .then((data) => {
        if (!alive) return
        setDepartment(data)
        setName(data.name)
        setManager(data.manager)
      })
      .catch((failure) => {
        if (!alive) return
        setLoadError(
          axios.isAxiosError(failure) && failure.response?.status === 404
            ? 'Este departamento não existe mais.'
            : 'Não foi possível carregar o departamento.'
        )
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [id, isCreate, retry])

  const close = () => {
    if (!busy.current) onClose()
  }

  async function save() {
    if (
      busy.current ||
      (!isCreate && !department) ||
      (!isCreate && id === undefined)
    )
      return
    if (isForm && !name.trim()) {
      setError('Informe o nome do departamento.')
      return
    }
    if (isForm && !manager) {
      setError('Selecione um gerente ativo.')
      return
    }

    busy.current = true
    setSaving(true)
    setError('')
    try {
      if (mode === 'delete') await deleteDepartment(id!)
      else if (mode === 'create')
        await createDepartment({ name: name.trim(), managerId: manager!.id })
      else
        await updateDepartment(id!, {
          name: name.trim(),
          managerId: manager!.id
        })
      toast.success(
        mode === 'delete'
          ? 'Departamento excluído.'
          : mode === 'create'
            ? 'Departamento cadastrado.'
            : 'Departamento atualizado.'
      )
      onSaved()
    } catch (failure) {
      const status = axios.isAxiosError(failure)
        ? failure.response?.status
        : undefined
      setError(
        status === 403
          ? 'Você não tem permissão para realizar esta ação.'
          : status === 404
            ? 'Departamento ou gerente não encontrado. Atualize a listagem.'
            : status === 409
              ? mode === 'delete'
                ? 'Não foi possível excluir devido a um vínculo existente.'
                : 'Já existe um departamento com esse nome.'
              : status === 400
                ? 'Confira os dados e selecione um gerente ativo.'
                : 'Não foi possível salvar a alteração. Tente novamente.'
      )
    } finally {
      busy.current = false
      setSaving(false)
    }
  }

  const title =
    mode === 'create'
      ? 'Cadastrar departamento'
      : mode === 'edit'
        ? 'Editar departamento'
        : 'Excluir departamento'

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-3xl border border-gray-200 bg-white p-6 text-primary-dark shadow-2xl backdrop:bg-primary-dark/30 backdrop:backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface dark:text-dark-text dark:backdrop:bg-black/50"
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id={titleId} className="text-lg font-bold">
            {title}
          </h2>
          {isForm && (
            <p className="mt-1 text-sm text-gray-500 dark:text-dark-muted">
              {isCreate
                ? 'Informe o nome e selecione um usuário ativo como gerente.'
                : 'Atualize o nome ou busque um usuário ativo para trocar o gerente.'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          disabled={saving}
          aria-label="Fechar"
          className="rounded-lg px-2 text-xl focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50"
        >
          ×
        </button>
      </header>

      {loadError ? (
        <div className="mt-6 space-y-3">
          <p role="alert">{loadError}</p>
          <Button
            title="Tentar novamente"
            onClick={() => setRetry((v) => v + 1)}
          />
        </div>
      ) : loading ? (
        <p role="status" className="mt-6">
          Carregando departamento...
        </p>
      ) : isForm ? (
        <form
          id={titleId + '-form'}
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
          className="mt-6 space-y-5"
          noValidate
        >
          <label className="block space-y-2">
            <span className="font-medium">
              Nome do departamento <span aria-hidden="true">*</span>
            </span>
            <input
              autoFocus
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={191}
              disabled={saving}
            />
          </label>

          {manager && <DepartmentManager manager={manager} />}
          <AsyncSearchSelect
            label={isCreate ? 'Gerente' : 'Buscar novo gerente'}
            selected={manager}
            onSelect={setManager}
            loadOptions={loadManagers}
            getOptionKey={managerKey}
            getOptionLabel={managerLabel}
            disabled={saving}
            minChars={3}
            required
            placeholder="Digite pelo menos 3 caracteres"
          />
        </form>
      ) : department ? (
        <div className="mt-6 space-y-5">
          <p className="break-words text-lg font-medium">{department.name}</p>
          <DepartmentManager manager={department.manager} />
          <p>
            {department._count.users}{' '}
            {department._count.users === 1
              ? 'usuário vinculado'
              : 'usuários vinculados'}
          </p>
          <p>
            Esta ação é irreversível. Os usuários vinculados serão mantidos e
            ficarão sem departamento.
          </p>
        </div>
      ) : null}

      {error && (
        <p role="alert" className="mt-4 text-sm text-error dark:text-red-300">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5 dark:border-dark-border">
        <Button
          title="Cancelar"
          type="button"
          variant="outline"
          onClick={close}
          disabled={saving}
        />
        {!loading && !loadError && (isCreate || department) && (
          <button
            type={isForm ? 'submit' : 'button'}
            form={isForm ? titleId + '-form' : undefined}
            onClick={!isForm ? () => void save() : undefined}
            disabled={saving}
            className={`inline-flex min-h-10 items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${mode === 'delete' ? 'border-red-600 bg-red-600 hover:bg-red-700' : 'border-primary bg-primary hover:bg-primary-hover'}`}
          >
            {saving
              ? 'Salvando...'
              : mode === 'delete'
                ? 'Excluir departamento'
                : mode === 'create'
                  ? 'Cadastrar departamento'
                  : 'Salvar alterações'}
          </button>
        )}
      </div>
    </dialog>
  )
}
