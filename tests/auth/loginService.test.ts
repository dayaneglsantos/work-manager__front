import { login } from '@/services/auth/loginService'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../mocks/server'

describe('loginService', () => {
  it('envia as credenciais e retorna a sessão', async () => {
    const session = { user: { id: 2, name: 'Test User' } }
    server.use(
      http.post('http://localhost:3000/login', async ({ request }) => {
        expect(await request.json()).toEqual({
          email: 'user@example.com',
          password: 'secret123'
        })
        return HttpResponse.json(session)
      })
    )

    await expect(
      login({ email: 'user@example.com', password: 'secret123' })
    ).resolves.toEqual(session)
  })

  it('propaga o erro 401 para a tela tratar credenciais inválidas', async () => {
    server.use(
      http.post('http://localhost:3000/login', () =>
        HttpResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
      )
    )

    await expect(
      login({ email: 'user@example.com', password: 'wrong-password' })
    ).rejects.toMatchObject({ response: { status: 401 } })
  })
})
