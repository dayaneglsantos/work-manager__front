'use client'

import Breadcrumb from '@/components/Breadcrumb'
import Button from '@/components/Button'
import Checkbox from '@/components/Checkbox'
import Pagination from '@/components/Pagination'
import SearchField from '@/components/SearchField'
import SelectField from '@/components/SelectField'
import UserCard from '@/components/UserCard'
import { getDepartments } from '@/services/departmentServices'
import { getUsers } from '@/services/userServices'
import { DepartmentType } from '@/types/departmentType'
import { UserType, UsersMetaType } from '@/types/userType'
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'

const PAGE_SIZE = 12

export default function Page() {
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState<number | ''>('')
  const [onlyActive, setOnlyActive] = useState(true)
  const [departments, setDepartments] = useState<DepartmentType[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [meta, setMeta] = useState<UsersMetaType | null>(null)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadDepartments = async () => {
      const data = await getDepartments()

      if (isMounted && Array.isArray(data)) {
        setDepartments(data)
      }
    }

    void loadDepartments()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const timeout = setTimeout(
      async () => {
        setIsLoading(true)
        setHasError(false)

        const response = await getUsers({
          page,
          pageSize: PAGE_SIZE,
          departmentId: departmentId || undefined,
          search: search.trim(),
          employmentStatus: onlyActive ? 'active' : undefined
        })

        if (!isMounted) return

        if (response) {
          setUsers(response.data)
          setMeta(response.meta)
        } else {
          setUsers([])
          setMeta(null)
          setHasError(true)
        }

        setIsLoading(false)
      },
      search ? 400 : 0
    )

    return () => {
      isMounted = false
      clearTimeout(timeout)
    }
  }, [departmentId, onlyActive, page, search])

  const departmentOptions = [
    { label: 'Todos os departamentos', value: '' },
    ...departments.map((department) => ({
      label: department.name,
      value: department.id
    }))
  ]

  return (
    <section>
      <Breadcrumb
        items={[{ label: 'Gestão', href: '/gestao' }, { label: 'Usuários' }]}
        className="mb-6"
      />

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-primary-light">
            Pessoas
          </span>
          <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
            Usuários
          </h1>
          <p className="mt-1 text-base leading-7 text-gray-600 dark:text-dark-muted">
            Consulte e gerencie os colaboradores cadastrados no sistema.
          </p>
        </div>

        <Button
          title="Cadastrar usuário"
          href="/gestao/usuarios/novo"
          icon={faUserPlus}
          className="w-full sm:w-auto"
        />
      </header>

      <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center dark:border-dark-border dark:bg-dark-surface">
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          label="Buscar usuário por nome"
          placeholder="Buscar por nome"
          className="sm:w-[360px] sm:flex-none"
        />
        <SelectField
          options={departmentOptions}
          value={departmentId}
          onChange={(value) => {
            if (value === '' || typeof value === 'number') {
              setDepartmentId(value)
              setPage(1)
            }
          }}
          placeholder="Todos os departamentos"
          className="w-full sm:w-72 sm:shrink-0"
        />
        <Checkbox
          label="Mostrar somente usuários ativos"
          checked={onlyActive}
          onChange={(checked) => {
            setOnlyActive(checked)
            setPage(1)
          }}
          className="sm:ml-1"
        />
      </div>

      <div className="mt-6">
        {!isLoading && !hasError && meta && (
          <p className="mb-4 text-sm text-gray-500 dark:text-dark-muted">
            {meta.totalCount}{' '}
            {meta.totalCount === 1
              ? 'usuário encontrado'
              : 'usuários encontrados'}
          </p>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center text-sm text-gray-500 dark:border-dark-border dark:text-dark-muted">
            Carregando usuários...
          </div>
        ) : hasError ? (
          <div className="rounded-2xl border border-error/20 bg-error/5 px-6 py-12 text-center text-sm text-error dark:text-red-300">
            Não foi possível carregar os usuários. Tente novamente mais tarde.
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-12 text-center dark:border-dark-border">
            <h2 className="font-semibold text-primary-dark dark:text-dark-text">
              Nenhum usuário encontrado
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-muted">
              Ajuste os filtros para consultar outros usuários.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        )}

        {meta && !isLoading && !hasError && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  )
}
