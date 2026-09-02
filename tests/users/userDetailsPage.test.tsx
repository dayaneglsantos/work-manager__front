import Page from '@/app/(dashboard)/gestao/usuarios/[id]/page'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../mocks/server'

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '7' })
}))

const userResponse = {
  id: 7,
  hasPassword: false,
  isSystemOwner: false,
  name: 'Maria Silva',
  email: 'maria@work-manager.local',
  cpf: '52998224725',
  phoneNumber: '11999999999',
  birthDate: '1990-05-20T00:00:00.000Z',
  currentSalary: 3500.5,
  admissionDate: '2024-01-10T00:00:00.000Z',
  currentPosition: 'Analista',
  employmentStatus: 'active',
  notes: 'Usuária de teste',
  profile: { id: 2, name: 'Colaborador', fullAccess: false },
  department: { id: 3, name: 'Operações' },
  address: {
    zipCode: '01310100',
    state: 'SP',
    city: 'São Paulo',
    street: 'Avenida Paulista',
    number: 1000,
    complement: null
  }
} as const

describe('User details page', () => {
  it('shows user details, permission access and resend for a pending invitation', async () => {
    const user = userEvent.setup()
    const resendRequest = vi.fn()

    server.use(
      http.get('http://localhost:3000/users/7', () =>
        HttpResponse.json(userResponse)
      ),
      http.post(
        'http://localhost:3000/users/7/password-invitation/resend',
        () => {
          resendRequest()
          return HttpResponse.json({
            message: 'Convite reenviado com sucesso.'
          })
        }
      )
    )

    render(<Page />)

    expect(
      await screen.findByRole('heading', { name: 'Maria Silva' })
    ).toBeInTheDocument()
    expect(screen.getByText('529.982.247-25')).toBeInTheDocument()
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument()
    expect(screen.getByText('10/01/2024')).toBeInTheDocument()
    expect(screen.getAllByText('Convite pendente')).toHaveLength(2)

    expect(
      screen.getByRole('link', { name: 'Editar permissões' })
    ).toHaveAttribute('href', '/gestao/usuarios/7/permissoes')
    expect(screen.getByRole('link', { name: 'Editar dados' })).toHaveAttribute(
      'href',
      '/gestao/usuarios/7/editar'
    )

    await user.click(screen.getByRole('button', { name: 'Reenviar convite' }))
    await waitFor(() => expect(resendRequest).toHaveBeenCalledOnce())
  })

  it('does not show resend when the user already has a password', async () => {
    server.use(
      http.get('http://localhost:3000/users/7', () =>
        HttpResponse.json({ ...userResponse, hasPassword: true })
      )
    )

    render(<Page />)

    expect(
      await screen.findByRole('heading', { name: 'Maria Silva' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reenviar convite' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Senha criada')).toBeInTheDocument()
  })

  it('does not show resend when the user is inactive', async () => {
    server.use(
      http.get('http://localhost:3000/users/7', () =>
        HttpResponse.json({ ...userResponse, employmentStatus: 'inactive' })
      )
    )

    render(<Page />)

    expect(
      await screen.findByRole('heading', { name: 'Maria Silva' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reenviar convite' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Acesso indisponível')).toBeInTheDocument()
  })

  it('does not offer permission editing for full-access profiles', async () => {
    server.use(
      http.get('http://localhost:3000/users/7', () =>
        HttpResponse.json({
          ...userResponse,
          profile: { ...userResponse.profile, fullAccess: true }
        })
      )
    )

    render(<Page />)

    expect(
      await screen.findByRole('heading', { name: 'Maria Silva' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Editar permissões' })
    ).not.toBeInTheDocument()
  })

  it('does not offer administrative editing actions for the system owner', async () => {
    server.use(
      http.get('http://localhost:3000/users/7', () =>
        HttpResponse.json({ ...userResponse, isSystemOwner: true })
      )
    )

    render(<Page />)

    expect(
      await screen.findByRole('heading', { name: 'Maria Silva' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Editar dados' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Editar permissões' })
    ).not.toBeInTheDocument()
  })
})
