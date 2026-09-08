'use client'

import { useEffect, useId, useRef, useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  deleteDepartment,
  getDepartment,
  listDepartmentManagers,
  updateDepartment
} from '@/services/departmentServices'
import { DepartmentDetails } from '@/types/departmentType'
import DepartmentManager from './DepartmentManager'
import Button from './Button'

type Manager = DepartmentDetails['manager']
type Props = {
  id: number
  mode: 'edit' | 'delete'
  canReadUsers: boolean
  onClose: () => void
  onSaved: () => void
}
const inputClass =
  'w-full rounded-xl border border-gray-300 bg-transparent p-3 dark:border-dark-border'

export default function DepartmentModal({
  id,
  mode,
  canReadUsers,
  onClose,
  onSaved
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const busy = useRef(false)
  const titleId = useId()
  const [department, setDepartment] = useState<DepartmentDetails | null>(null)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [manager, setManager] = useState<Manager | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [managers, setManagers] = useState<Manager[]>([])
  const [hasNext, setHasNext] = useState(false)
  const [searching, setSearching] = useState(false)
  const [managerError, setManagerError] = useState('')

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
    let alive = true
    setLoadError('')
    getDepartment(id)
      .then((data) => {
        if (!alive) return
        setDepartment(data)
        setName(data.name)
        setManager(data.manager)
      })
      .catch((err) => {
        if (alive)
          setLoadError(
            axios.isAxiosError(err) && err.response?.status === 404
              ? 'Este departamento não existe mais.'
              : 'Não foi possível carregar os detalhes do departamento.'
          )
      })
    return () => {
      alive = false
    }
  }, [id, retry])

  useEffect(() => {
    if (mode !== 'edit' || !canReadUsers) return
    let alive = true
    setSearching(true)
    setManagerError('')
    const timer = setTimeout(() => {
      listDepartmentManagers(search, page)
        .then((result) => {
          if (!alive) return
          setManagers(
            result.data.map((user) => ({
              id: user.id,
              name: user.name,
              employmentStatus: user.employmentStatus,
              profileImage: user.profileImage ?? null
            }))
          )
          setHasNext(result.meta.hasNextPage)
        })
        .catch(() => {
          if (alive) {
            setManagers([])
            setManagerError(
              'Não foi possível carregar os gerentes. Tente outra busca.'
            )
          }
        })
        .finally(() => {
          if (alive) setSearching(false)
        })
    }, 300)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [mode, canReadUsers, search, page])

  async function save() {
    if (busy.current || !department || !manager) return
    if (mode === 'edit' && !name.trim()) {
      setError('Informe o nome do departamento.')
      return
    }
    busy.current = true
    setSaving(true)
    setError('')
    try {
      if (mode === 'delete') await deleteDepartment(id)
      else
        await updateDepartment(id, { name: name.trim(), managerId: manager.id })
      toast.success(
        mode === 'delete'
          ? 'Departamento excluído.'
          : 'Departamento atualizado.'
      )
      onSaved()
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      setError(
        status === 403
          ? 'Você não tem permissão para realizar esta ação.'
          : status === 404
            ? 'Departamento ou gerente não encontrado. Atualize a listagem.'
            : status === 409
              ? mode === 'edit'
                ? 'Já existe um departamento com esse nome.'
                : 'Não foi possível excluir devido a um vínculo existente.'
              : status === 400
                ? 'Confira os dados. Ao trocar o gerente, selecione um usuário ativo.'
                : 'Não foi possível salvar a alteração. Tente novamente.'
      )
    } finally {
      busy.current = false
      setSaving(false)
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy.current) onClose()
      }}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-primary-dark shadow-xl backdrop:bg-black/50 dark:bg-dark-surface dark:text-dark-text"
    >
      <h2 id={titleId} className="mb-5 text-xl font-semibold">
        {mode === 'edit' ? 'Editar departamento' : 'Excluir departamento'}
      </h2>
      {loadError ? (
        <div className="space-y-3">
          <p role="alert">{loadError}</p>
          <Button
            title="Tentar novamente"
            onClick={() => setRetry((v) => v + 1)}
          />
        </div>
      ) : !department ? (
        <p role="status">Carregando detalhes...</p>
      ) : mode === 'edit' ? (
        <form
          id={titleId + '-form'}
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
          className="space-y-4"
        >
          <label className="block space-y-2">
            <span>Nome do departamento</span>
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={191}
              disabled={saving}
            />
          </label>
          {manager && <DepartmentManager manager={manager} />}
          {canReadUsers ? (
            <fieldset className="space-y-3" disabled={saving}>
              <legend className="mb-2 font-medium">Alterar gerente</legend>
              <label className="block space-y-2">
                <span>Buscar usuário ativo</span>
                <input
                  className={inputClass}
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                />
              </label>
              {searching ? (
                <p role="status">Buscando gerentes...</p>
              ) : managerError ? (
                <p role="alert">{managerError}</p>
              ) : (
                <>
                  <label className="block space-y-2">
                    <span>Gerente</span>
                    <select
                      className={inputClass}
                      value={manager?.id ?? ''}
                      onChange={(event) => {
                        const selected = [department.manager, ...managers].find(
                          (item) => item.id === Number(event.target.value)
                        )
                        if (selected) setManager(selected)
                      }}
                    >
                      {manager && (
                        <option value={manager.id}>
                          {manager.name} (selecionado)
                        </option>
                      )}
                      {[department.manager, ...managers]
                        .filter(
                          (item, index, all) =>
                            item.id !== manager?.id &&
                            all.findIndex((other) => other.id === item.id) ===
                              index
                        )
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  {managers.length === 0 && (
                    <p className="text-sm">
                      Nenhum usuário ativo encontrado nesta busca.
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      title="Anterior"
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((v) => v - 1)}
                    />
                    <span className="text-sm">Página {page}</span>
                    <Button
                      type="button"
                      title="Próxima"
                      variant="outline"
                      disabled={!hasNext}
                      onClick={() => setPage((v) => v + 1)}
                    />
                  </div>
                </>
              )}
            </fieldset>
          ) : (
            <p className="text-sm text-gray-500">
              A troca de gerente requer permissão para consultar usuários. Você
              pode editar o nome mantendo o gerente atual.
            </p>
          )}
        </form>
      ) : (
        <div className="space-y-5">
          <p className="break-words text-lg font-medium">{department.name}</p>
          <DepartmentManager manager={department.manager} />
          <p>
            {department._count.users}{' '}
            {department._count.users === 1
              ? 'usuário vinculado'
              : 'usuários vinculados'}
          </p>
          {mode === 'delete' && (
            <p>
              Esta ação é irreversível. Os usuários vinculados serão mantidos e
              ficarão sem departamento.
            </p>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-4 text-red-600">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          autoFocus
          type="button"
          disabled={saving}
          onClick={onClose}
          className="rounded-xl border border-gray-300 px-4 py-2 disabled:opacity-50"
        >
          Cancelar
        </button>
        {department && (
          <button
            type={mode === 'edit' ? 'submit' : 'button'}
            form={mode === 'edit' ? titleId + '-form' : undefined}
            disabled={saving}
            onClick={mode === 'delete' ? () => void save() : undefined}
            className={`rounded-xl px-4 py-2 text-white disabled:opacity-50 ${mode === 'delete' ? 'bg-red-600' : 'bg-primary'}`}
          >
            {saving
              ? 'Salvando...'
              : mode === 'delete'
                ? 'Excluir departamento'
                : 'Salvar alterações'}
          </button>
        )}
      </div>
    </dialog>
  )
}
