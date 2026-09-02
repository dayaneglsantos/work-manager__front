import Breadcrumb from '@/components/Breadcrumb'
import PermissionEditor from '@/components/PermissionEditor'

export default function Page() {
  return (
    <section>
      <Breadcrumb
        items={[{ label: 'Gestão', href: '/gestao' }, { label: 'Permissões' }]}
        className="mb-6"
      />

      <header className="max-w-2xl">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-primary-light">
          Controle de acesso
        </span>
        <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
          Permissões por perfil
        </h1>
        <p className="mt-1 text-base leading-7 text-gray-600 dark:text-dark-muted">
          Selecione um perfil e defina as ações disponíveis para cada área do
          sistema.
        </p>
      </header>

      <PermissionEditor mode="profile" />
    </section>
  )
}
