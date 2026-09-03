import Page from '@/app/(dashboard)/gestao/perfis/page'
import ProfileCard from '@/components/ProfileCard'
import ProfileModal from '@/components/ProfileModal'
import DeleteProfileModal from '@/components/DeleteProfileModal'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '../mocks/server'

const auth = vi.hoisted(() => ({
  loading: false,
  session: { permissions: [] as Array<{ name: string; hasPermission: boolean }> }
}))

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => auth }))
vi.mock('react-hot-toast', () => ({ default: { success: vi.fn() } }))

const api = 'http://localhost:3000'
const regular = { id: 2, name: 'Operações', fullAccess: false, userCount: 3 }
const admin = { id: 1, name: 'Admin', fullAccess: true, userCount: 1 }
const emptyProfile = { ...regular, userCount: 0 }
const originalShowModal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')

// Apenas simula a visibilidade. Foco nativo, top layer e Tab precisam de navegador.
beforeAll(() => {
  // jsdom não calcula layout nem fornece ResizeObserver. O tooltip real
  // permanece ativo; somente a observação de dimensões é simulada.
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) { this.setAttribute('open', '') }
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) { this.removeAttribute('open') }
  })
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (originalShowModal) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShowModal)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

beforeEach(() => {
  auth.loading = false
  auth.session.permissions = ['read-profiles', 'create-profiles', 'update-profiles'].map(
    (name) => ({ name, hasPermission: true })
  )
})

describe('Profile deletion', () => {
  it.each(['hover', 'focus'] as const)('shows the library tooltip on %s and prevents deletion for linked users', async (interaction) => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<ProfileCard profile={regular} onDelete={onDelete} />)
    const button = screen.getByRole('button', { name: 'Excluir perfil Operações' })
    expect(button).toHaveAttribute('aria-disabled', 'true')
    if (interaction === 'hover') await user.hover(button)
    else await user.tab()
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Este perfil possui usuários vinculados e não pode ser excluído.')
    await user.click(button)
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('does not offer deletion for Admin or sessions without delete permission', async () => {
    const card = render(<ProfileCard profile={admin} onDelete={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /Excluir perfil/ })).not.toBeInTheDocument()
    card.unmount()
    server.use(http.get(`${api}/profiles`, () => HttpResponse.json([emptyProfile])))
    render(<Page />)
    await screen.findByRole('heading', { name: 'Operações' })
    expect(screen.queryByRole('button', { name: /Excluir perfil/ })).not.toBeInTheDocument()
  })

  it('requires confirmation, permits cancellation, then deletes and refreshes the list', async () => {
    auth.session.permissions.push({ name: 'delete-profiles', hasPermission: true })
    const user = userEvent.setup()
    const removed = vi.fn()
    let deleted = false
    server.use(
      http.get(`${api}/profiles`, () => HttpResponse.json(deleted ? [] : [emptyProfile])),
      http.delete(`${api}/profiles/2`, () => {
        removed()
        deleted = true
        return new HttpResponse(null, { status: 204 })
      })
    )
    render(<Page />)
    const trigger = await screen.findByRole('button', { name: 'Excluir perfil Operações' })
    await user.click(trigger)
    expect(screen.getByRole('dialog')).toHaveTextContent('Esta ação não pode ser desfeita.')
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
    expect(removed).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(removed).not.toHaveBeenCalled()
    await user.click(trigger)
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Excluir perfil' }))
    expect(await screen.findByText('Nenhum perfil cadastrado')).toBeInTheDocument()
    expect(removed).toHaveBeenCalledOnce()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it.each([
    [409, 'possui usuários vinculados ou é protegido'],
    [403, 'Você não tem permissão para excluir'],
    [404, 'Este perfil não existe mais'],
    [500, 'Não foi possível excluir o perfil']
  ] as const)('keeps the confirmation open after API status %i', async (status, message) => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()
    server.use(http.delete(`${api}/profiles/2`, () => new HttpResponse(null, { status })))
    render(<DeleteProfileModal profile={emptyProfile} onClose={vi.fn()} onDeleted={onDeleted} />)
    await user.click(screen.getByRole('button', { name: 'Excluir perfil' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('blocks double deletion and cancellation while the request is pending', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onDeleted = vi.fn()
    const requestReceived = vi.fn()
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    server.use(http.delete(`${api}/profiles/2`, async () => {
      requestReceived()
      await gate
      return new HttpResponse(null, { status: 204 })
    }))
    render(<DeleteProfileModal profile={emptyProfile} onClose={onClose} onDeleted={onDeleted} />)
    try {
      await user.click(screen.getByRole('button', { name: 'Excluir perfil' }))
      await waitFor(() => expect(requestReceived).toHaveBeenCalledOnce())
      expect(screen.getByRole('button', { name: 'Excluindo...' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
      await user.click(screen.getByRole('button', { name: 'Excluindo...' }))
      fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
      expect(onClose).not.toHaveBeenCalled()
      expect(requestReceived).toHaveBeenCalledOnce()
    } finally {
      release()
    }
    await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce())
  })
})

describe('Profile card', () => {
  it.each([[0, '0 usuários'], [1, '1 usuário'], [3, '3 usuários']] as const)(
    'shows the user count %i with the appropriate label', (userCount, label) => {
      render(<ProfileCard profile={{ ...regular, userCount }} />)
      const count = screen.getByText(label)
      expect(count).toBeInTheDocument()
      expect(count.parentElement).toHaveClass('flex-row-reverse')
      expect(count.parentElement?.querySelector('svg')).toHaveAttribute('data-icon', 'users')
      expect(screen.queryByText(/Os usuários deste perfil herdam/)).not.toBeInTheDocument()
    }
  )

  it('shows the Admin count and badge without offering editing', () => {
    render(<ProfileCard profile={admin} onEdit={vi.fn()} />)
    expect(screen.getByText('1 usuário')).toBeInTheDocument()
    expect(screen.getByText('Acesso total')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Editar perfil/ })).not.toBeInTheDocument()
  })

  it('offers an accessible icon-only edit button when permitted', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    render(<ProfileCard profile={regular} onEdit={onEdit} />)
    const button = screen.getByRole('button', { name: 'Editar perfil Operações' })
    expect(button.textContent).toBe('')
    await user.click(button)
    expect(onEdit).toHaveBeenCalledOnce()
  })

  it('does not offer editing without the edit callback', () => {
    render(<ProfileCard profile={regular} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('Profile list', () => {
  it('lists counts and hides write actions for a read-only session', async () => {
    auth.session.permissions = [{ name: 'read-profiles', hasPermission: true }]
    server.use(http.get(`${api}/profiles`, () => HttpResponse.json([admin, regular])))
    render(<Page />)
    expect(await screen.findByRole('heading', { name: 'Operações' })).toBeInTheDocument()
    expect(screen.getByText('2 perfis encontrados')).toBeInTheDocument()
    expect(screen.getByText('3 usuários')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cadastrar perfil' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Editar perfil/ })).not.toBeInTheDocument()
  })

  it('waits for the session and denies access without fetching when read is not granted', () => {
    auth.loading = true
    auth.session.permissions = []
    const fetchProfiles = vi.fn()
    server.use(http.get(`${api}/profiles`, () => { fetchProfiles(); return HttpResponse.json([]) }))
    const { rerender } = render(<Page />)
    expect(screen.getByRole('status')).toHaveTextContent('Carregando sessão')
    auth.loading = false
    rerender(<Page />)
    expect(screen.getByRole('alert')).toHaveTextContent('Você não tem permissão')
    expect(fetchProfiles).not.toHaveBeenCalled()
  })

  it('shows an empty state', async () => {
    server.use(http.get(`${api}/profiles`, () => HttpResponse.json([])))
    render(<Page />)
    expect(await screen.findByText('Nenhum perfil cadastrado')).toBeInTheDocument()
  })

  it('allows retry after a failed request', async () => {
    const user = userEvent.setup()
    server.use(http.get(`${api}/profiles`, () => new HttpResponse(null, { status: 500 })))
    render(<Page />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar')
    server.use(http.get(`${api}/profiles`, () => HttpResponse.json([regular])))
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(await screen.findByRole('heading', { name: 'Operações' })).toBeInTheDocument()
  })

  it('honors an API denial even if the session still grants read access', async () => {
    server.use(http.get(`${api}/profiles`, () => new HttpResponse(null, { status: 403 })))
    render(<Page />)
    expect(await screen.findByRole('alert')).toHaveTextContent('Você não tem permissão')
    expect(screen.queryByRole('button', { name: 'Cadastrar perfil' })).not.toBeInTheDocument()
  })

  it('creates through the modal and refreshes the list with the server count', async () => {
    const user = userEvent.setup()
    const payload = vi.fn()
    let created = false
    server.use(
      http.get(`${api}/profiles`, () => HttpResponse.json(created ? [regular] : [])),
      http.post(`${api}/profiles`, async ({ request }) => {
        payload(await request.json())
        created = true
        return HttpResponse.json({ id: 2, name: 'Operações', fullAccess: false }, { status: 201 })
      })
    )
    render(<Page />)
    await screen.findByText('Nenhum perfil cadastrado')
    await user.click(screen.getByRole('button', { name: 'Cadastrar perfil' }))
    const dialog = screen.getByRole('dialog', { name: 'Cadastrar perfil' })
    const field = within(dialog).getByRole('textbox', { name: /Nome do perfil/ })
    expect(field).toHaveFocus()
    await user.type(field, '  Operações  ')
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar perfil' }))
    expect(await screen.findByRole('heading', { name: 'Operações' })).toBeInTheDocument()
    expect(payload).toHaveBeenCalledWith({ name: 'Operações' })
    expect(screen.getByText('3 usuários')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('prefills the edit modal and refreshes the renamed profile', async () => {
    const user = userEvent.setup()
    let name = regular.name
    const payload = vi.fn()
    server.use(
      http.get(`${api}/profiles`, () => HttpResponse.json([{ ...regular, name }])),
      http.put(`${api}/profiles/2`, async ({ request }) => {
        payload(await request.json())
        name = 'Suporte'
        return HttpResponse.json({ id: 2, name, fullAccess: false })
      })
    )
    render(<Page />)
    await user.click(await screen.findByRole('button', { name: 'Editar perfil Operações' }))
    const field = screen.getByRole('textbox', { name: /Nome do perfil/ })
    expect(field).toHaveValue('Operações')
    await user.clear(field)
    await user.type(field, 'Suporte')
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByRole('heading', { name: 'Suporte' })).toBeInTheDocument()
    expect(payload).toHaveBeenCalledWith({ name: 'Suporte' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Profile modal validation and closing', () => {
  it('rejects whitespace without sending a request', async () => {
    const user = userEvent.setup()
    const save = vi.fn()
    server.use(http.post(`${api}/profiles`, () => { save(); return HttpResponse.json({}) }))
    render(<ProfileModal profile={null} onClose={vi.fn()} onSaved={vi.fn()} />)
    await user.type(screen.getByRole('textbox'), '   ')
    await user.click(screen.getByRole('button', { name: 'Cadastrar perfil' }))
    expect(await screen.findByText('Informe o nome do perfil.')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(save).not.toHaveBeenCalled()
  })

  it('shows a duplicate name error beside the field without closing', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn()
    server.use(http.post(`${api}/profiles`, () => HttpResponse.json({
      error: 'There is already a registered profile with this name.'
    }, { status: 409 })))
    render(<ProfileModal profile={null} onClose={vi.fn()} onSaved={onSaved} />)
    await user.type(screen.getByRole('textbox'), 'Operações')
    await user.click(screen.getByRole('button', { name: 'Cadastrar perfil' }))
    expect(await screen.findByText('Já existe um perfil com esse nome.')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(onSaved).not.toHaveBeenCalled()
  })

  it.each([
    [403, 'Você não tem permissão para salvar este perfil.'],
    [409, 'Este perfil é protegido e não pode ser alterado.'],
    [404, 'Este perfil não existe mais. Feche a janela e atualize a listagem.'],
    [500, 'Não foi possível salvar o perfil. Tente novamente.']
  ] as const)('shows the API error for status %i', async (status, message) => {
    const user = userEvent.setup()
    server.use(http.put(`${api}/profiles/2`, () => new HttpResponse(null, { status })))
    render(<ProfileModal profile={regular} onClose={vi.fn()} onSaved={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(message)
    expect(screen.getByRole('button', { name: 'Salvar alterações' })).toBeEnabled()
  })

  it('handles native cancel and restores focus and scrolling when unmounted', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const openerView = render(<button>Abrir perfil</button>)
    const opener = screen.getByRole('button', { name: 'Abrir perfil' })
    await user.click(opener)
    const previousOverflow = document.body.style.overflow
    const modal = render(<ProfileModal profile={null} onClose={onClose} onSaved={vi.fn()} />)
    expect(document.body.style.overflow).toBe('hidden')
    // O navegador emite cancel ao pressionar Escape; jsdom não faz essa tradução.
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
    expect(onClose).toHaveBeenCalledOnce()
    modal.unmount()
    expect(opener).toHaveFocus()
    expect(document.body.style.overflow).toBe(previousOverflow)
    openerView.unmount()
  })

  it('blocks closing and additional submissions while saving', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSaved = vi.fn()
    const received = vi.fn()
    let release!: () => void
    const gate = new Promise<void>((resolve) => { release = resolve })
    server.use(http.put(`${api}/profiles/2`, async () => {
      received()
      await gate
      return HttpResponse.json(regular)
    }))
    render(<ProfileModal profile={regular} onClose={onClose} onSaved={onSaved} />)
    try {
      await user.click(screen.getByRole('button', { name: 'Salvar alterações' }))
      await waitFor(() => expect(received).toHaveBeenCalledOnce())
      expect(screen.getByRole('button', { name: 'Salvando...' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Fechar' })).toBeDisabled()
      fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }))
      fireEvent.submit(screen.getByRole('textbox').closest('form')!)
      expect(onClose).not.toHaveBeenCalled()
      expect(received).toHaveBeenCalledOnce()
    } finally {
      release()
    }
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
  })
})
