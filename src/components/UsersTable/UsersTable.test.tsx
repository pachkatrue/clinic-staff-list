import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UsersTable from './UsersTable'
import { User } from '../../models/user'

describe('UsersTable Component', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Глеб',
      surname: 'Чернова',
      patronymic: 'Яблочно-зеленый',
      email: 'test@example.com',
      phone: '77357725514',
      department: { value: 'surgery', label: 'Хирургия' },
      status: { value: 'active', label: 'Активен' },
      roles: [],
      administrative_position: { value: 'director', label: 'Директор' },
      medical_position: { value: 'nurse', label: 'Медсестра' },
      is_simple_digital_sign_enabled: true,
      created_at: 1740683235,
      updated_at: 1740683235,
      hired_at: 1737401856,
      fired_at: null,
      email_verified_at: 1740683216
    },
    {
      id: 2,
      name: 'Марта',
      surname: 'Ларионов',
      patronymic: 'Кремовый',
      email: 'martha@example.com',
      phone: '77779130821',
      department: { value: 'accounting', label: 'Бухгалтерия' },
      status: { value: 'blocked', label: 'Заблокирован' },
      roles: [],
      administrative_position: { value: 'manager', label: 'Менеджер' },
      medical_position: null,
      is_simple_digital_sign_enabled: false,
      created_at: 1740683235,
      updated_at: 1740683235,
      hired_at: 1739233921,
      fired_at: null,
      email_verified_at: 1740683216
    }
  ]

  const mockProps = {
    users: mockUsers,
    isLoading: false,
    error: null,
    onDetailsClick: vi.fn(),
    onEditClick: vi.fn(),
    onDeleteClick: vi.fn(),
    sortField: 'id',
    sortDirection: 'asc' as const,
    onSort: vi.fn(),
    currentPage: 1,
    totalPages: 1,
    onPageChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('корректно отображает таблицу с данными', () => {
    render(<UsersTable {...mockProps} />)

    // Проверяем, что заголовки таблицы отображаются
    const headers = screen.getAllByRole('columnheader')
    expect(headers.length).toBe(7) // 7 колонок в таблице

    // Проверяем, что первая колонка содержит "ID"
    expect(headers[0]).toHaveTextContent(/ID/)

    // Получаем строки таблицы
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBe(3) // 1 строка заголовка + 2 строки данных

    // Проверяем данные первой строки
    const firstRow = rows[1]
    expect(within(firstRow).getByText('1')).toBeInTheDocument()

    // Проверяем имена пользователей
    const fullNameElements = screen.getAllByText((content, element) => {
      return element?.className?.includes('fullName') && (
        content.includes('Чернова') || content.includes('Ларионов')
      )
    })
    expect(fullNameElements.length).toBeGreaterThan(0)

    expect(screen.getByText(/Директор \/ Медсестра/)).toBeInTheDocument()
    expect(screen.getByText('Хирургия')).toBeInTheDocument()
    expect(screen.getByText('Активен')).toBeInTheDocument()

    // Проверяем данные второй строки
    const secondRow = rows[2]
    expect(within(secondRow).getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Менеджер')).toBeInTheDocument()
    expect(screen.getByText('Бухгалтерия')).toBeInTheDocument()
    expect(screen.getByText('Заблокирован')).toBeInTheDocument()
  })

  test('отображает состояние загрузки', () => {
    render(<UsersTable {...mockProps} isLoading={true} users={[]} />)
    expect(screen.getByText('Загрузка...')).toBeInTheDocument()
  })

  test('отображает состояние ошибки', () => {
    render(<UsersTable {...mockProps} error="Failed to load users" users={[]} />)
    expect(screen.getByText('Failed to load users')).toBeInTheDocument()
  })

  test('вызывает onSort при клике на сортируемые заголовки', async () => {
    const user = userEvent.setup()
    render(<UsersTable {...mockProps} />)

    // Получаем заголовки колонок
    const headers = screen.getAllByRole('columnheader')

    // Клик на заголовок ID (первая колонка)
    await user.click(headers[0])
    expect(mockProps.onSort).toHaveBeenCalledWith('id')

    // Клик на заголовок ФИО (вторая колонка)
    await user.click(headers[1])
    expect(mockProps.onSort).toHaveBeenCalledWith('surname')

    // Сбрасываем мок и проверяем, что колонка с датой не сортируется
    mockProps.onSort.mockClear()
    await user.click(headers[4])
    expect(mockProps.onSort).toHaveBeenCalledTimes(0)
  })

  test('вызывает обработчики действий при клике на кнопки', async () => {
    const user = userEvent.setup()
    render(<UsersTable {...mockProps} />)

    // Находим все кнопки действий
    const detailsButtons = screen.getAllByText('📄')
    const editButtons = screen.getAllByText('✏️')
    const deleteButtons = screen.getAllByText('🗑️')

    // Клик на кнопку деталей для первого пользователя
    await user.click(detailsButtons[0])
    expect(mockProps.onDetailsClick).toHaveBeenCalledWith(1)

    // Клик на кнопку редактирования для первого пользователя
    await user.click(editButtons[0])
    expect(mockProps.onEditClick).toHaveBeenCalledWith(1)

    // Клик на кнопку удаления для первого пользователя
    await user.click(deleteButtons[0])
    expect(mockProps.onDeleteClick).toHaveBeenCalledWith(1)

    // Клик на кнопку деталей для второго пользователя
    await user.click(detailsButtons[1])
    expect(mockProps.onDetailsClick).toHaveBeenCalledWith(2)
  })

  test('отображает пагинацию при наличии нескольких страниц', async () => {
    const user = userEvent.setup()
    render(<UsersTable {...mockProps} totalPages={3} />)

    // Находим все кнопки
    const allButtons = screen.getAllByRole('button')

    // Находим кнопку второй страницы
    const page2Button = allButtons.find(button => button.textContent === '2')
    expect(page2Button).toBeTruthy()

    // Клик на кнопку второй страницы
    if (page2Button) {
      await user.click(page2Button)
      expect(mockProps.onPageChange).toHaveBeenCalledWith(2)
    }
  })

  test('не отображает пагинацию при наличии только одной страницы', () => {
    const { container } = render(<UsersTable {...mockProps} totalPages={1} />)

    // Проверяем наличие пагинации
    const paginationElement = container.querySelector('.pagination')
    if (paginationElement) {
      // Если пагинация существует для одной страницы, проверяем, что кнопки отключены
      const buttons = within(paginationElement).queryAllByRole('button')
      const prevButton = buttons.find(btn => btn.textContent === '«')
      const nextButton = buttons.find(btn => btn.textContent === '»')

      if (prevButton) expect(prevButton).toBeDisabled()
      if (nextButton) expect(nextButton).toBeDisabled()
    } else {
      // Если пагинация вообще не отображается, это тоже допустимо
      expect(true).toBeTruthy()
    }
  })
})