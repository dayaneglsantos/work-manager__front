'use client'

import Breadcrumb from '@/components/Breadcrumb'
import UserForm from '@/components/UserForm'
import { createUser, uploadProfileImage } from '@/services/userServices'
import {
  CreateUserPayload,
  CreateUserResponse,
  ProfileImageChange
} from '@/types/userType'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function Page() {
  const router = useRouter()

  const handleCreateUser = async (
    payload: CreateUserPayload,
    profileImage: ProfileImageChange
  ) => {
    let user: CreateUserResponse

    try {
      user = await createUser(payload)

      if (user.invitationSent) {
        toast.success('Usuário cadastrado e convite enviado com sucesso')
      } else {
        toast('Usuário cadastrado, mas o convite não pôde ser enviado', {
          icon: '⚠️'
        })
      }
    } catch (error) {
      console.error(error)
      toast.error('Não foi possível cadastrar o usuário')
      return
    }

    if (profileImage.file) {
      try {
        await uploadProfileImage(user.id, profileImage.file)
      } catch (error) {
        console.error(error)
        toast.error(
          'Usuário cadastrado, mas não foi possível enviar a imagem de perfil'
        )
      }
    }

    router.push('/gestao/usuarios')
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
          Preencha os dados pessoais e profissionais. O novo colaborador
          receberá um convite por e-mail para criar sua senha.
        </p>
      </header>

      <UserForm mode="create" onSubmit={handleCreateUser} />
    </section>
  )
}
