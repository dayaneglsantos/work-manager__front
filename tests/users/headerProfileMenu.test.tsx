import Header from '@/components/Header'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  saveSession: vi.fn(),
  uploadProfileImage: vi.fn(),
  removeProfileImage: vi.fn()
}))

const session = {
  id: 7,
  name: 'Usuária Teste',
  profileImage: null,
  profile: { id: 2, name: 'Funcionário' },
  permissions: []
}

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ session, saveSession: mocks.saveSession })
}))

vi.mock('@/services/userServices', () => ({
  uploadProfileImage: mocks.uploadProfileImage,
  removeProfileImage: mocks.removeProfileImage
}))

vi.mock('@/components/NotificationsModal', () => ({
  default: () => null
}))

vi.mock('@/components/ToggleTheme', () => ({
  default: () => null
}))

vi.mock('@/components/Avatar', () => ({
  default: () => <span>Avatar</span>
}))

vi.mock('@/components/AvatarModal', () => ({
  default: ({
    open,
    onApply
  }: {
    open: boolean
    onApply: (change: {
      file: File | null
      removeCurrentImage: boolean
    }) => Promise<void>
  }) =>
    open ? (
      <button
        type="button"
        onClick={() =>
          onApply({
            file: new File(['avatar'], 'avatar.webp', { type: 'image/webp' }),
            removeCurrentImage: false
          })
        }
      >
        Confirmar novo avatar
      </button>
    ) : null
}))

describe('header profile menu', () => {
  beforeEach(() => {
    mocks.saveSession.mockReset()
    mocks.uploadProfileImage.mockReset().mockResolvedValue({
      id: 7,
      profileImage: 'https://example.com/avatar.webp'
    })
    mocks.removeProfileImage.mockReset()
  })

  it('offers avatar and personal data actions', async () => {
    const user = userEvent.setup()
    render(<Header />)

    await user.click(
      screen.getByRole('button', { name: 'Abrir opções do perfil' })
    )

    expect(
      screen.getByRole('menuitem', { name: 'Alterar avatar' })
    ).toBeVisible()
    expect(
      screen.getByRole('menuitem', { name: 'Editar dados' })
    ).toHaveAttribute('href', '/gestao/usuarios/7/editar')
  })

  it('uploads the selected avatar and refreshes the session', async () => {
    const user = userEvent.setup()
    render(<Header />)

    await user.click(
      screen.getByRole('button', { name: 'Abrir opções do perfil' })
    )
    await user.click(screen.getByRole('menuitem', { name: 'Alterar avatar' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirmar novo avatar' })
    )

    await waitFor(() =>
      expect(mocks.uploadProfileImage).toHaveBeenCalledWith(7, expect.any(File))
    )
    expect(mocks.saveSession).toHaveBeenCalledWith({
      ...session,
      profileImage: 'https://example.com/avatar.webp'
    })
  })
})
