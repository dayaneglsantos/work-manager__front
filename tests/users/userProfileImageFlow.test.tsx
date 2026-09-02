import EditUserPage from '@/app/(dashboard)/gestao/usuarios/[id]/editar/page'
import CreateUserPage from '@/app/(dashboard)/gestao/usuarios/novo/page'
import { UserType } from '@/types/userType'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const serviceMock = vi.hoisted(() => ({
  createUser: vi.fn(),
  getUserById: vi.fn(),
  removeProfileImage: vi.fn(),
  updateUser: vi.fn(),
  uploadProfileImage: vi.fn()
}))
const navigationMock = vi.hoisted(() => ({
  push: vi.fn()
}))
const toastMock = vi.hoisted(() =>
  Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn()
  })
)

vi.mock('@/services/userServices', () => serviceMock)

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '10' }),
  useRouter: () => navigationMock
}))

vi.mock('react-hot-toast', () => ({
  default: toastMock
}))

vi.mock('@/components/Breadcrumb', () => ({
  default: () => null
}))

vi.mock('@/components/UserForm', () => ({
  default: ({
    mode,
    onSubmit
  }: {
    mode: 'create' | 'edit'
    onSubmit: (
      payload: Record<string, unknown>,
      profileImage: { file: File | null; removeCurrentImage: boolean }
    ) => Promise<void>
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onSubmit(
            { name: 'Usuário Teste' },
            {
              file: new File(['profile-image'], 'avatar.webp', {
                type: 'image/webp'
              }),
              removeCurrentImage: false
            }
          )
        }
      >
        {mode === 'create' ? 'Cadastrar com imagem' : 'Atualizar com imagem'}
      </button>

      {mode === 'edit' && (
        <button
          type="button"
          onClick={() =>
            onSubmit(
              { name: 'Usuário Teste' },
              { file: null, removeCurrentImage: true }
            )
          }
        >
          Atualizar removendo imagem
        </button>
      )}
    </div>
  )
}))

const existingUser: UserType = {
  id: 10,
  hasPassword: true,
  name: 'Usuário Teste',
  email: 'usuario@work-manager.local',
  employmentStatus: 'active',
  profileImage: 'https://example.com/current-avatar.webp',
  profile: { id: 1, name: 'Funcionário', fullAccess: false },
  department: null
}

describe('profile image flow on user pages', () => {
  beforeEach(() => {
    serviceMock.createUser.mockResolvedValue({ id: 10, invitationSent: true })
    serviceMock.getUserById.mockResolvedValue(existingUser)
    serviceMock.removeProfileImage.mockResolvedValue({
      id: 10,
      profileImage: null
    })
    serviceMock.updateUser.mockResolvedValue(existingUser)
    serviceMock.uploadProfileImage.mockResolvedValue({
      id: 10,
      profileImage: 'https://example.com/new-avatar.webp'
    })
  })

  it('cria o usuário antes de enviar sua imagem', async () => {
    const user = userEvent.setup()
    render(<CreateUserPage />)

    await user.click(
      screen.getByRole('button', { name: 'Cadastrar com imagem' })
    )

    await waitFor(() =>
      expect(serviceMock.uploadProfileImage).toHaveBeenCalledWith(
        10,
        expect.any(File)
      )
    )
    expect(serviceMock.createUser.mock.invocationCallOrder[0]).toBeLessThan(
      serviceMock.uploadProfileImage.mock.invocationCallOrder[0]
    )
    expect(navigationMock.push).toHaveBeenCalledWith('/gestao/usuarios')
  })

  it('preserva o cadastro e informa quando somente a imagem falha', async () => {
    const user = userEvent.setup()
    serviceMock.uploadProfileImage.mockRejectedValue(
      new Error('Cloudinary unavailable')
    )
    render(<CreateUserPage />)

    await user.click(
      screen.getByRole('button', { name: 'Cadastrar com imagem' })
    )

    await waitFor(() =>
      expect(toastMock.error).toHaveBeenCalledWith(
        'Usuário cadastrado, mas não foi possível enviar a imagem de perfil'
      )
    )
    expect(navigationMock.push).toHaveBeenCalledWith('/gestao/usuarios')
  })

  it('atualiza o usuário antes de substituir sua imagem', async () => {
    const user = userEvent.setup()
    render(<EditUserPage />)

    await user.click(
      await screen.findByRole('button', { name: 'Atualizar com imagem' })
    )

    await waitFor(() =>
      expect(serviceMock.uploadProfileImage).toHaveBeenCalledWith(
        10,
        expect.any(File)
      )
    )
    expect(serviceMock.updateUser.mock.invocationCallOrder[0]).toBeLessThan(
      serviceMock.uploadProfileImage.mock.invocationCallOrder[0]
    )
  })

  it('remove a imagem somente depois de atualizar os dados', async () => {
    const user = userEvent.setup()
    render(<EditUserPage />)

    await user.click(
      await screen.findByRole('button', {
        name: 'Atualizar removendo imagem'
      })
    )

    await waitFor(() =>
      expect(serviceMock.removeProfileImage).toHaveBeenCalledWith(10)
    )
    expect(serviceMock.updateUser.mock.invocationCallOrder[0]).toBeLessThan(
      serviceMock.removeProfileImage.mock.invocationCallOrder[0]
    )
    expect(serviceMock.uploadProfileImage).not.toHaveBeenCalled()
  })
})
