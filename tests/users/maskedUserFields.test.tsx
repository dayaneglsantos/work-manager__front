import PhoneField from '@/components/PhoneField'
import ZipCodeField from '@/components/ZipCodeField'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

describe('masked user fields', () => {
  it('formata o telefone, limita a quantidade e entrega somente os dígitos', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    function ControlledPhoneField() {
      const [value, setValue] = useState('')

      return (
        <PhoneField
          name="phoneNumber"
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue)
            onChange(nextValue)
          }}
          onBlur={vi.fn()}
        />
      )
    }

    render(<ControlledPhoneField />)
    const input = screen.getByLabelText('Telefone')

    await user.type(input, '61999999999999')

    expect(input).toHaveValue('(61) 99999-9999')
    expect(onChange).toHaveBeenLastCalledWith('61999999999')
  })

  it('formata o CEP, limita a quantidade e entrega somente os dígitos', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    function ControlledZipCodeField() {
      const [value, setValue] = useState('')

      return (
        <ZipCodeField
          name="address.zipCode"
          value={value}
          onChange={(nextValue) => {
            setValue(nextValue)
            onChange(nextValue)
          }}
          onBlur={vi.fn()}
        />
      )
    }

    render(<ControlledZipCodeField />)
    const input = screen.getByLabelText('CEP')

    await user.type(input, '726301022222')

    expect(input).toHaveValue('72630-102')
    expect(onChange).toHaveBeenLastCalledWith('72630102')
  })
})
