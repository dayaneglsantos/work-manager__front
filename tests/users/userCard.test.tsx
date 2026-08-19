import UserCard from '@/components/UserCard'
import { UserType } from '@/types/userType'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const serviceMock = vi.hoisted(() => ({
  resendPasswordInvitation: vi.fn()
}))
const toastMock = vi.hoisted(() => ({
  loading: vi.fn(() => 'resend-toast'),
  success: vi.fn(),
  error: vi.fn()
}))

vi.mock('@/services/userServices', () => ({
  resendPasswordInvitation: (...args: unknown[]) =>
    serviceMock.resendPasswordInvitation(...args)
}))

vi.mock('react-hot-toast', () => ({
  default: toastMock
}))

const buildUser = (hasPassword: boolean): UserType => ({
  id: 10,
  hasPassword,
  name: 'Usuário Teste',
  email: 'usuario@work-manager.local',
  employmentStatus: 'active',
  currentPosition: 'Desenvolvedor',
  profile: {
    id: 1,
    name: 'Funcionário'
  },
  department: null
})

describe('UserCard', () => {
  beforeEach(() => {
    serviceMock.resendPasswordInvitation.mockReset()
    toastMock.loading.mockClear()
    toastMock.success.mockClear()
    toastMock.error.mockClear()
  })

  it('reenvia o convite de um usuário sem senha e atualiza o toast', async () => {
    const user = userEvent.setup()
    serviceMock.resendPasswordInvitation.mockResolvedValue({
      message: 'Convite reenviado com sucesso.'
    })
    render(<UserCard user={buildUser(false)} />)

    await user.click(
      screen.getByRole('button', { name: 'Mais ações para Usuário Teste' })
    )
    await user.click(screen.getByRole('menuitem', { name: 'Reenviar convite' }))

    expect(toastMock.loading).toHaveBeenCalledWith('Reenviando...')
    await waitFor(() =>
      expect(serviceMock.resendPasswordInvitation).toHaveBeenCalledWith(10)
    )
    expect(toastMock.success).toHaveBeenCalledWith(
      'Convite reenviado com sucesso',
      { id: 'resend-toast' }
    )
  })

  it('não oferece reenvio quando o usuário já possui senha', async () => {
    const user = userEvent.setup()
    render(<UserCard user={buildUser(true)} />)

    await user.click(
      screen.getByRole('button', { name: 'Mais ações para Usuário Teste' })
    )

    expect(
      screen.queryByRole('menuitem', { name: 'Reenviar convite' })
    ).not.toBeInTheDocument()
  })
})
