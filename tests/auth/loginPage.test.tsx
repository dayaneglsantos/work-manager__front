import Login from '@/app/login/page'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()
const saveSession = vi.fn()
const clearLocalSession = vi.fn()
const login = vi.fn()

vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    saveSession,
    clearLocalSession,
    session: null,
    loading: false
  })
}))
vi.mock('@/services/auth/loginService', () => ({
  login: (...args: unknown[]) => login(...args)
}))

describe('Login page', () => {
  beforeEach(() => login.mockReset())

  it('exibe as validações e não chama a API com dados inválidos', async () => {
    render(<Login />)

    fireEvent.submit(
      screen.getByRole('button', { name: 'Entrar' }).closest('form')!
    )

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
    expect(
      screen.getByText('Senha deve ter no mínimo 8 caracteres')
    ).toBeInTheDocument()
    expect(login).not.toHaveBeenCalled()
  })

  it('salva a sessão e redireciona após autenticar', async () => {
    const user = userEvent.setup()
    const session = { user: { id: 2, name: 'Test User' } }
    login.mockResolvedValue(session)
    render(<Login />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'user@example.com')
    await user.type(screen.getByPlaceholderText('Senha'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123'
      })
    )
    expect(saveSession).toHaveBeenCalledWith(session)
    expect(push).toHaveBeenCalledWith('/')
  })

  it('não cria uma sessão quando a API não retorna dados', async () => {
    const user = userEvent.setup()
    login.mockResolvedValue(undefined)
    render(<Login />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'user@example.com')
    await user.type(screen.getByPlaceholderText('Senha'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(login).toHaveBeenCalledOnce())
    expect(saveSession).not.toHaveBeenCalled()
    expect(push).not.toHaveBeenCalled()
  })
})
