import ProfileImageField from '@/components/ProfileImageField'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createObjectUrlMock = vi.fn(() => 'blob:profile-image-preview')
const revokeObjectUrlMock = vi.fn()

const getFileInput = (container: HTMLElement) => {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]')

  if (!input) throw new Error('Profile image input was not rendered')

  return input
}

describe('ProfileImageField', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrlMock
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrlMock
    })
  })

  it('exibe o preview e comunica a seleção de uma imagem válida', async () => {
    const onChange = vi.fn()
    const file = new File(['image-content'], 'avatar.webp', {
      type: 'image/webp'
    })
    const { container } = render(<ProfileImageField onChange={onChange} />)

    await userEvent.upload(getFileInput(container), file)

    expect(onChange).toHaveBeenCalledWith(file, false)
    await waitFor(() =>
      expect(screen.getByAltText('Avatar do usuário')).toHaveAttribute(
        'src',
        'blob:profile-image-preview'
      )
    )
  })

  it('rejeita arquivos que não são imagens permitidas', () => {
    const onChange = vi.fn()
    const file = new File(['text-content'], 'notes.txt', {
      type: 'text/plain'
    })
    const { container } = render(<ProfileImageField onChange={onChange} />)

    fireEvent.change(getFileInput(container), { target: { files: [file] } })

    expect(
      screen.getByText('Escolha uma imagem JPG, PNG ou WEBP.')
    ).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('rejeita uma imagem maior que 5 MB', () => {
    const onChange = vi.fn()
    const file = new File([new Uint8Array(5_000_001)], 'large-image.png', {
      type: 'image/png'
    })
    const { container } = render(<ProfileImageField onChange={onChange} />)

    fireEvent.change(getFileInput(container), { target: { files: [file] } })

    expect(
      screen.getByText('A imagem deve ter no máximo 5 MB.')
    ).toBeInTheDocument()
    expect(onChange).not.toHaveBeenCalled()
  })

  it('comunica a remoção da imagem atual', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(
      <ProfileImageField
        currentImage="https://example.com/current-avatar.webp"
        onChange={onChange}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Remover imagem' }))

    expect(onChange).toHaveBeenCalledWith(null, true)
    expect(
      screen.queryByRole('button', { name: 'Remover imagem' })
    ).not.toBeInTheDocument()
  })
})
