'use client'

import Breadcrumb from '@/components/Breadcrumb'
import PermissionEditor from '@/components/PermissionEditor'
import { useParams } from 'next/navigation'

export default function Page() {
  const params = useParams<{ id: string }>()
  const userId = Number(params.id)

  return (
    <section>
      <Breadcrumb
        items={[
          { label: 'Gestão', href: '/gestao' },
          { label: 'Usuários', href: '/gestao/usuarios' },
          { label: 'Permissões personalizadas' }
        ]}
        className="mb-6"
      />

      <header className="max-w-2xl">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-primary-light">
          Controle de acesso
        </span>
        <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
          Permissões do usuário
        </h1>
        <p className="mt-1 text-base leading-7 text-gray-600 dark:text-dark-muted">
          Personalize apenas as permissões que devem ser diferentes do perfil
          deste usuário.
        </p>
      </header>

      <PermissionEditor mode="user" userId={userId} />
    </section>
  )
}
