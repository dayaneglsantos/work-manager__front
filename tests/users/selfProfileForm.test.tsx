import UserForm from '@/components/UserForm'
import { SelfProfileType } from '@/types/userType'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/services/departmentServices', () => ({
  getDepartments: vi.fn()
}))

vi.mock('@/services/profileServices', () => ({
  getProfiles: vi.fn()
}))

const profile: SelfProfileType = {
  id: 7,
  name: 'Usuária Teste',
  email: 'usuario@work-manager.local',
  cpf: '10000000876',
  phoneNumber: '61999999999',
  birthDate: '1990-01-10T00:00:00.000Z',
  profileImage: null,
  address: null,
  profile: { id: 2, name: 'Funcionário', fullAccess: false },
  isSystemOwner: false
}

describe('self profile form', () => {
  it('shows only personal data and address while protecting email and CPF', () => {
    render(
      <UserForm mode="self-edit" initialUser={profile} onSubmit={vi.fn()} />
    )

    expect(
      screen.getByRole('heading', { name: 'Dados pessoais' })
    ).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Endereço' })).toBeVisible()
    expect(
      screen.queryByRole('heading', { name: 'Dados profissionais' })
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText(/E-mail/)).toBeDisabled()
    expect(screen.getByLabelText(/CPF/)).toBeDisabled()
  })
})
