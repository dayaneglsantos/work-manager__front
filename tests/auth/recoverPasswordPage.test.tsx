import RecoverPasswordPage from '@/app/recuperar-senha/page'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestPasswordReset = vi.fn()
const verifyPasswordResetCode = vi.fn()
const confirmPasswordReset = vi.fn()

vi.mock('@/services/auth/passwordResetService', () => ({
  requestPasswordReset: (...args: unknown[]) => requestPasswordReset(...args),
  verifyPasswordResetCode: (...args: unknown[]) =>
    verifyPasswordResetCode(...args),
  confirmPasswordReset: (...args: unknown[]) => confirmPasswordReset(...args)
}))

describe('Recover password page', () => {
  beforeEach(() => {
    requestPasswordReset.mockReset()
    verifyPasswordResetCode.mockReset()
    confirmPasswordReset.mockReset()
  })

  it('valida o e-mail antes de solicitar um código', async () => {
    const user = userEvent.setup()
    render(<RecoverPasswordPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'invalid-email')
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))

    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
    expect(requestPasswordReset).not.toHaveBeenCalled()
  })

  it('normaliza o e-mail e aceita somente seis números no código', async () => {
    const user = userEvent.setup()
    requestPasswordReset.mockResolvedValue({ message: 'Código enviado.' })
    render(<RecoverPasswordPage />)

    await user.type(
      screen.getByPlaceholderText('E-mail'),
      '  USER@Example.COM  '
    )
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))

    expect(await screen.findByText('Etapa 2 de 3')).toBeInTheDocument()
    expect(requestPasswordReset).toHaveBeenCalledWith({
      email: 'user@example.com'
    })

    const codeInput = screen.getByPlaceholderText('Código de 6 dígitos')
    await user.type(codeInput, 'ab12c345678')
    expect(codeInput).toHaveValue('123456')
  })

  it('conclui as três etapas e exibe a confirmação', async () => {
    const user = userEvent.setup()
    requestPasswordReset.mockResolvedValue({ message: 'Código enviado.' })
    verifyPasswordResetCode.mockResolvedValue({
      message: 'Código válido.',
      resetToken: 'token-123'
    })
    confirmPasswordReset.mockResolvedValue({
      message: 'Sua senha foi redefinida.'
    })
    render(<RecoverPasswordPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    await user.type(
      await screen.findByPlaceholderText('Código de 6 dígitos'),
      '123456'
    )
    await user.click(screen.getByRole('button', { name: 'Validar código' }))
    await user.type(
      await screen.findByPlaceholderText('Nova senha'),
      'new-password'
    )
    await user.type(
      screen.getByPlaceholderText('Confirme a nova senha'),
      'new-password'
    )
    await user.click(screen.getByRole('button', { name: 'Redefinir senha' }))

    expect(
      await screen.findByRole('heading', { name: 'Senha redefinida' })
    ).toBeInTheDocument()
    expect(screen.getByText('Sua senha foi redefinida.')).toBeInTheDocument()
    expect(confirmPasswordReset).toHaveBeenCalledWith({
      resetToken: 'token-123',
      newPassword: 'new-password',
      confirmPassword: 'new-password'
    })
  })

  it('não avança quando a API rejeita o código', async () => {
    const user = userEvent.setup()
    requestPasswordReset.mockResolvedValue({ message: 'Código enviado.' })
    verifyPasswordResetCode.mockRejectedValue(new Error('Código inválido'))
    render(<RecoverPasswordPage />)

    await user.type(screen.getByPlaceholderText('E-mail'), 'user@example.com')
    await user.click(screen.getByRole('button', { name: 'Enviar código' }))
    await user.type(
      await screen.findByPlaceholderText('Código de 6 dígitos'),
      '999999'
    )
    await user.click(screen.getByRole('button', { name: 'Validar código' }))

    await waitFor(() => expect(verifyPasswordResetCode).toHaveBeenCalledOnce())
    expect(screen.getByText('Etapa 2 de 3')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Nova senha')).not.toBeInTheDocument()
  })
})
