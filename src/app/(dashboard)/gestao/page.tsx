import ManagementCard from '@/components/ManagementCard'
import departmentsIcon from '@/assets/icons/departments.png'
import usersIcon from '@/assets/icons/users.png'
import profilesIcon from '@/assets/icons/profiles.png'
import permissionsIcon from '@/assets/icons/permissions.png'
import tagsIcon from '@/assets/icons/tags.png'

const managementOptions = [
  {
    title: 'Departamentos',
    description: 'Organize departamentos, equipes e seus responsáveis.',
    image: departmentsIcon
  },
  {
    title: 'Usuários',
    description: 'Cadastre colaboradores e mantenha seus dados atualizados.',
    image: usersIcon,
    href: '/gestao/usuarios'
  },
  {
    title: 'Perfis',
    description: 'Defina funções e níveis de acesso para cada perfil.',
    image: profilesIcon,
    href: '/gestao/perfis'
  },
  {
    title: 'Permissões',
    description: 'Controle as ações disponíveis em cada área do sistema.',
    image: permissionsIcon,
    href: '/gestao/permissoes'
  },
  {
    title: 'Tags',
    description: 'Crie categorias para organizar e identificar tarefas.',
    image: tagsIcon
  }
]

export default function Page() {
  return (
    <section>
      <header className="max-w-2xl">
        <span className="text-sm font-semibold tracking-wide text-primary uppercase dark:text-primary-light">
          Administração
        </span>
        <h1 className="mt-2 text-2xl font-bold text-primary-dark sm:text-3xl dark:text-dark-text">
          Central de gestão
        </h1>
        <p className="mt-1 text-base leading-7 text-gray-600 dark:text-dark-muted">
          Gerencie a estrutura, os acessos e as configurações do Work Manager em
          um só lugar.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {managementOptions.map((option) => (
          <ManagementCard key={option.title} {...option} />
        ))}
      </div>
    </section>
  )
}
