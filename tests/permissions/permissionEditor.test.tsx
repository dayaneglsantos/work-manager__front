import PermissionEditor from '@/components/PermissionEditor'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '../mocks/server'

describe('PermissionEditor', () => {
  it('starts with no profile selected and saves grouped profile permissions', async () => {
    const user = userEvent.setup()
    const updateRequest = vi.fn()

    server.use(
      http.get('http://localhost:3000/profiles', () =>
        HttpResponse.json([{ id: 1, name: 'Administradores' }])
      ),
      http.get('http://localhost:3000/profiles/1/permissions', () =>
        HttpResponse.json({
          profile: { id: 1, name: 'Administradores' },
          permissions: [
            {
              permissionId: 10,
              name: 'read-users',
              type: 'users',
              action: 'read',
              hasPermission: false
            }
          ]
        })
      ),
      http.put(
        'http://localhost:3000/profiles/1/permissions',
        async ({ request }) => {
          updateRequest(await request.json())
          return HttpResponse.json({
            profile: { id: 1, name: 'Administradores' },
            permissions: [
              {
                permissionId: 10,
                name: 'read-users',
                type: 'users',
                action: 'read',
                hasPermission: true
              }
            ]
          })
        }
      )
    )

    render(<PermissionEditor mode="profile" />)

    expect(
      await screen.findByRole('heading', { name: 'Selecione um perfil' })
    ).toBeInTheDocument()
    expect(screen.queryByText('Perfil selecionado')).not.toBeInTheDocument()

    await user.click(screen.getByRole('combobox'))
    await user.click(screen.getByText('Administradores'))

    expect(await screen.findByText('Perfil selecionado')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Usuários' })
    ).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Permitir ação' }))
    await user.click(screen.getByRole('button', { name: 'Salvar permissões' }))

    await waitFor(() =>
      expect(updateRequest).toHaveBeenCalledWith({
        permissions: [{ permissionId: 10, hasPermission: true }]
      })
    )
  })

  it('highlights a custom user permission and can restore profile inheritance', async () => {
    const user = userEvent.setup()
    const updateRequest = vi.fn()

    server.use(
      http.get('http://localhost:3000/users/7/permissions', () =>
        HttpResponse.json({
          user: {
            id: 7,
            name: 'Maria Silva',
            profile: { id: 2, name: 'Colaborador' }
          },
          permissions: [
            {
              permissionId: 10,
              name: 'read-users',
              type: 'users',
              action: 'read',
              profileValue: true,
              customValue: false,
              effectiveValue: false
            }
          ]
        })
      ),
      http.put(
        'http://localhost:3000/users/7/permissions',
        async ({ request }) => {
          updateRequest(await request.json())
          return HttpResponse.json({
            user: {
              id: 7,
              name: 'Maria Silva',
              profile: { id: 2, name: 'Colaborador' }
            },
            permissions: [
              {
                permissionId: 10,
                name: 'read-users',
                type: 'users',
                action: 'read',
                profileValue: true,
                customValue: null,
                effectiveValue: true
              }
            ]
          })
        }
      )
    )

    render(<PermissionEditor mode="user" userId={7} />)

    expect(await screen.findByText('Maria Silva')).toBeInTheDocument()
    expect(
      screen.getByText('Perfil de origem: Colaborador')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Personalizada', { selector: 'span' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Permitir ação' })
    ).not.toBeChecked()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Permitir ação' }))
    expect(
      screen.queryByText('Personalizada', { selector: 'span' })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Salvar permissões' }))

    await waitFor(() =>
      expect(updateRequest).toHaveBeenCalledWith({
        permissions: [{ permissionId: 10, customValue: null }]
      })
    )
  })
})
