import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBar from './SearchBar'

describe('SearchBar Component', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('отображает поле поиска и кнопку', () => {
    render(<SearchBar value="" onChange={mockOnChange} />)

    expect(screen.getByPlaceholderText('Поиск по ФИО...')).toBeInTheDocument()
    expect(screen.getByText('🔍')).toBeInTheDocument()
  })

  test('инициализируется с переданным значением', () => {
    render(<SearchBar value="Test" onChange={mockOnChange} />)

    expect(screen.getByPlaceholderText('Поиск по ФИО...')).toHaveValue('Test')
  })

  test('обновляет значение при вводе', async () => {
    const user = userEvent.setup()
    render(<SearchBar value="" onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText('Поиск по ФИО...')
    await user.type(input, 'John')

    expect(input).toHaveValue('John')
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  test('вызывает onChange при отправке формы', async () => {
    const user = userEvent.setup()
    render(<SearchBar value="" onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText('Поиск по ФИО...')
    const button = screen.getByText('🔍')

    await user.type(input, 'John')
    await user.click(button)

    expect(mockOnChange).toHaveBeenCalledWith('John')
  })

  test('вызывает onChange при нажатии клавиши Enter', async () => {
    const user = userEvent.setup()
    render(<SearchBar value="" onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText('Поиск по ФИО...')

    await user.type(input, 'John')
    await user.click(screen.getByRole('button'))

    expect(mockOnChange).toHaveBeenCalledWith('John')
  })

  test('обновляет ввод при изменении свойства value', () => {
    const { rerender } = render(<SearchBar value="" onChange={mockOnChange} />)

    const input = screen.getByPlaceholderText('Поиск по ФИО...')
    expect(input).toHaveValue('')

    rerender(<SearchBar value="Updated Value" onChange={mockOnChange} />)

    expect(input).toHaveValue('Updated Value')
  })
})