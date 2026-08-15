'use client'

import Breadcrumb from '@/components/Breadcrumb'
import UserForm from '@/components/UserForm'
import { createUser } from '@/services/userServices'
import { CreateUserPayload } from '@/types/userType'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Page() {
  const router = useRouter()

  const handleCreateUser = async (payload: CreateUserPayload) => {
    try {
      await createUser(payload)
      toast.success('Usuário cadastrado com sucesso')
      router.push('/gestao/usuarios')
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível cadastrar o usuário')
    }
  }

  return (
    <section>
      <Breadcrumb
        items={[
          { label: 'Gestão', href: '/gestao' },
          { label: 'Usuários', href: '/gestao/usuarios' },
          { label: 'Novo usuário' }
        ]}
        className="mb-6"
      />

      <header className="mb-8 max-w-2xl">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-primary-light">
          Pessoas
        </span>
        <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
          Cadastrar usuário
        </h1>
        <p className="mt-1 text-base leading-7 text-gray-600 dark:text-dark-muted">
          Preencha os dados pessoais, profissionais e de acesso do novo
          colaborador.
        </p>
      </header>

      <UserForm mode="create" onSubmit={handleCreateUser} />
    </section>
  )
}
