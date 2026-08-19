import CreatePasswordPage from '@/app/criar-senha/page'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const serviceMock = vi.hoisted(() => ({
  verifyPasswordCreationCode: vi.fn(),
  confirmPasswordCreation: vi.fn()
}))
const navigationMock = vi.hoisted(() => ({
  query: 'email=user%40example.com'
}))

vi.mock('@/services/auth/passwordCreationService', () => ({
  verifyPasswordCreationCode: (...args: unknown[]) =>
    serviceMock.verifyPasswordCreationCode(...args),
  confirmPasswordCreation: (...args: unknown[]) =>
    serviceMock.confirmPasswordCreation(...args)
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(navigationMock.query)
}))

describe('Create password page', () => {
  beforeEach(() => {
    navigationMock.query = 'email=user%40example.com'
    serviceMock.verifyPasswordCreationCode.mockReset()
    serviceMock.confirmPasswordCreation.mockReset()
  })

  it('valida o código e conclui a criação da primeira senha', async () => {
    const user = userEvent.setup()
    serviceMock.verifyPasswordCreationCode.mockResolvedValue({
      message: 'Código verificado com sucesso.',
      passwordToken: 'password-token'
    })
    serviceMock.confirmPasswordCreation.mockResolvedValue({
      message: 'Senha criada com sucesso.'
    })
    render(<CreatePasswordPage />)

    await user.type(
      screen.getByPlaceholderText('Código de 6 dígitos'),
      'ab12c345678'
    )
    expect(screen.getByPlaceholderText('Código de 6 dígitos')).toHaveValue(
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
    await user.click(screen.getByRole('button', { name: 'Criar senha' }))

    expect(serviceMock.verifyPasswordCreationCode).toHaveBeenCalledWith({
      email: 'user@example.com',
      code: '123456'
    })
    expect(serviceMock.confirmPasswordCreation).toHaveBeenCalledWith({
      passwordToken: 'password-token',
      newPassword: 'new-password',
      confirmPassword: 'new-password'
    })
    expect(
      await screen.findByRole('heading', { name: 'Senha criada' })
    ).toBeInTheDocument()
  })

  it('permanece na validação quando o código é rejeitado', async () => {
    const user = userEvent.setup()
    serviceMock.verifyPasswordCreationCode.mockRejectedValue(
      new Error('Código inválido')
    )
    render(<CreatePasswordPage />)

    await user.type(
      screen.getByPlaceholderText('Código de 6 dígitos'),
      '999999'
    )
    await user.click(screen.getByRole('button', { name: 'Validar código' }))

    await waitFor(() =>
      expect(serviceMock.verifyPasswordCreationCode).toHaveBeenCalledOnce()
    )
    expect(screen.getByText('Etapa 1 de 2')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Nova senha')).not.toBeInTheDocument()
  })

  it('informa quando o link não possui um e-mail válido', () => {
    navigationMock.query = ''
    render(<CreatePasswordPage />)

    expect(
      screen.getByRole('heading', { name: 'Link de convite inválido' })
    ).toBeInTheDocument()
    expect(serviceMock.verifyPasswordCreationCode).not.toHaveBeenCalled()
  })
})
