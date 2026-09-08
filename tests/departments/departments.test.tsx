import Page from '@/app/(dashboard)/gestao/departamentos/page'
import { render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '../mocks/server'

const auth = vi.hoisted(() => ({
  loading: false,
  session: { permissions: [] as { name: string; hasPermission: boolean }[] }
}))
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn() } }))
const api = 'http://localhost:3000'
const department = {
  id: 1,
  name: 'Operações',
  managerId: 2,
  manager: {
    id: 2,
    name: 'Ana',
    employmentStatus: 'inactive',
    profileImage: 'https://example.com/ana.jpg'
  },
  _count: { users: 3 }
}
beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open')
    }
  })
})
beforeEach(() => {
  auth.session.permissions = [
    'read-departments',
    'update-departments',
    'delete-departments'
  ].map((name) => ({ name, hasPermission: true }))
  server.use(
    http.get(`${api}/departments`, () => HttpResponse.json([department])),
    http.get(`${api}/departments/1`, () => HttpResponse.json(department))
  )
})
describe('Departamentos', () => {
  it('exibe gerente, imagem e contagem no card', async () => {
    render(<Page />)
    expect(await screen.findByText('Ana')).toBeInTheDocument()
    expect(screen.getByAltText('Foto de Ana')).toHaveAttribute(
      'src',
      department.manager.profileImage
    )
    expect(screen.getByText('Gerente não ativo')).toBeInTheDocument()
    expect(screen.getByText('3 usuários vinculados')).toBeInTheDocument()
  })
  it('confirma a exclusão com integrantes e atualiza a lista', async () => {
    const user = userEvent.setup()
    let removed = false
    server.use(
      http.get(`${api}/departments`, () =>
        HttpResponse.json(removed ? [] : [department])
      ),
      http.delete(`${api}/departments/1`, () => {
        removed = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    render(<Page />)
    await user.click(
      await screen.findByRole('button', { name: 'Opções de Operações' })
    )
    await user.click(screen.getByRole('menuitem', { name: 'Excluir' }))
    expect(
      await within(screen.getByRole('dialog')).findByText(
        /ficarão sem departamento/
      )
    ).toBeInTheDocument()
    expect(removed).toBe(false)
    await user.click(
      screen.getByRole('button', { name: 'Excluir departamento' })
    )
    expect(
      await screen.findByText('Nenhum departamento cadastrado.')
    ).toBeInTheDocument()
  })
  it('renomeia mantendo o gerente inativo sem consultar usuários', async () => {
    const user = userEvent.setup()
    let payload: unknown
    server.use(
      http.patch(`${api}/departments/1`, async ({ request }) => {
        payload = await request.json()
        return HttpResponse.json(department)
      })
    )
    render(<Page />)
    await user.click(
      await screen.findByRole('button', { name: 'Opções de Operações' })
    )
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    const input = await screen.findByRole('textbox', {
      name: 'Nome do departamento'
    })
    await user.clear(input)
    await user.type(input, ' Suporte ')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() =>
      expect(payload).toEqual({ name: 'Suporte', managerId: 2 })
    )
  })
  it('busca gerentes ativos e permite substituir o gerente', async () => {
    auth.session.permissions.push({ name: 'read-users', hasPermission: true })
    const user = userEvent.setup()
    let payload: unknown
    server.use(
      http.get(`${api}/users`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('employmentStatus')).toBe(
          'active'
        )
        return HttpResponse.json({
          data: [
            {
              id: 5,
              name: 'Bruno',
              employmentStatus: 'active',
              profileImage: null
            }
          ],
          meta: { hasNextPage: false }
        })
      }),
      http.patch(`${api}/departments/1`, async ({ request }) => {
        payload = await request.json()
        return HttpResponse.json(department)
      })
    )
    render(<Page />)
    await user.click(
      await screen.findByRole('button', { name: 'Opções de Operações' })
    )
    await user.click(screen.getByRole('menuitem', { name: 'Editar' }))
    await screen.findByRole('option', { name: 'Bruno' })
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Gerente' }),
      '5'
    )
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    await waitFor(() =>
      expect(payload).toEqual({ name: 'Operações', managerId: 5 })
    )
  })
  it('oculta ações sem permissão e impede consulta sem leitura', async () => {
    auth.session.permissions = [
      { name: 'read-departments', hasPermission: true }
    ]
    const view = render(<Page />)
    await screen.findByText('Ana')
    expect(
      screen.queryByRole('button', { name: /Opções/ })
    ).not.toBeInTheDocument()
    view.unmount()
    auth.session.permissions = []
    const request = vi.fn()
    server.use(http.get(`${api}/departments`, request))
    render(<Page />)
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Você não tem permissão'
    )
    expect(request).not.toHaveBeenCalled()
  })
  it('permite recuperar erro na listagem', async () => {
    server.use(
      http.get(
        `${api}/departments`,
        () => new HttpResponse(null, { status: 500 })
      )
    )
    const user = userEvent.setup()
    render(<Page />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar'
    )
    server.use(http.get(`${api}/departments`, () => HttpResponse.json([])))
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(
      await screen.findByText('Nenhum departamento cadastrado.')
    ).toBeInTheDocument()
  })
})
