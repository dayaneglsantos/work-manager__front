import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordResetCode
} from '@/services/auth/passwordResetService'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../mocks/server'

describe('passwordResetService', () => {
  it('envia o e-mail para solicitar o código', async () => {
    server.use(
      http.post(
        'http://localhost:3000/password-reset/request',
        async ({ request }) => {
          expect(await request.json()).toEqual({ email: 'user@example.com' })
          return HttpResponse.json({ message: 'Código enviado.' })
        }
      )
    )

    await expect(
      requestPasswordReset({ email: 'user@example.com' })
    ).resolves.toEqual({ message: 'Código enviado.' })
  })

  it('envia o código e retorna o token temporário', async () => {
    server.use(
      http.post(
        'http://localhost:3000/password-reset/verify',
        async ({ request }) => {
          expect(await request.json()).toEqual({
            email: 'user@example.com',
            code: '123456'
          })
          return HttpResponse.json({
            message: 'Código válido.',
            resetToken: 'token-123'
          })
        }
      )
    )

    await expect(
      verifyPasswordResetCode({ email: 'user@example.com', code: '123456' })
    ).resolves.toEqual({ message: 'Código válido.', resetToken: 'token-123' })
  })

  it('envia o token e as novas senhas para concluir a redefinição', async () => {
    server.use(
      http.post(
        'http://localhost:3000/password-reset/confirm',
        async ({ request }) => {
          expect(await request.json()).toEqual({
            resetToken: 'token-123',
            newPassword: 'new-password',
            confirmPassword: 'new-password'
          })
          return HttpResponse.json({ message: 'Senha redefinida.' })
        }
      )
    )

    await expect(
      confirmPasswordReset({
        resetToken: 'token-123',
        newPassword: 'new-password',
        confirmPassword: 'new-password'
      })
    ).resolves.toEqual({ message: 'Senha redefinida.' })
  })
})
