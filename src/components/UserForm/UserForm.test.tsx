import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserForm from './UserForm'
import styles from './UserForm.module.css'
import { ValueLabel, User } from '../../models/user'

describe('UserForm Component', () => {
  const mockDepartments: ValueLabel[] = [
    { value: 'surgery', label: 'Хирургия' },
    { value: 'therapy', label: 'Терапия' }
  ]

  const mockAdminPositions: ValueLabel[] = [
    { value: 'director', label: 'Директор', type: 'administrative' },
    { value: 'manager', label: 'Менеджер', type: 'administrative' }
  ]

  const mockMedicalPositions: ValueLabel[] = [
    { value: 'dentist', label: 'Стоматолог', type: 'medical' },
    { value: 'nurse', label: 'Медсестра', type: 'medical' }
  ]

  const mockSubmit = vi.fn()

  const mockUser: User = {
    id: 1,
    name: 'Глеб',
    surname: 'Чернова',
    patronymic: 'Яблочно-зеленый',
    email: 'test@example.com',
    phone: '77357725514',
    department: { value: 'surgery', label: 'Хирургия' },
    status: { value: 'active', label: 'Активен' },
    roles: [],
    administrative_position: { value: 'director', label: 'Директор', type: 'administrative' },
    medical_position: { value: 'nurse', label: 'Медсестра', type: 'medical' },
    is_simple_digital_sign_enabled: true,
    created_at: 1740683235,
    updated_at: 1740683235,
    hired_at: 1737401856,
    fired_at: null,
    email_verified_at: 1740683216
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('корректно отображает пустую форму', () => {
    render(
      <UserForm
        user={null}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    // Проверяем наличие основных полей формы
    expect(screen.getByLabelText(/фамилия/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/отчество/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/телефон/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()

    // Для DatePicker используем data-testid
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /создать сотрудника/i })).toBeInTheDocument()
  })

  test('корректно отображает форму с данными пользователя', () => {
    render(
      <UserForm
        user={mockUser}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    // Проверяем, что поля формы заполнены данными пользователя
    expect(screen.getByLabelText(/фамилия/i)).toHaveValue('Чернова')
    expect(screen.getByLabelText(/имя/i)).toHaveValue('Глеб')
    expect(screen.getByLabelText(/отчество/i)).toHaveValue('Яблочно-зеленый')
    expect(screen.getByLabelText(/телефон/i)).toHaveValue('77357725514')
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('test@example.com')

    // Для DatePicker мы просто проверяем его наличие, так как проверить значение сложнее
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: /сохранить изменения/i })).toBeInTheDocument()
  })

  test('проверяет обязательные поля', async () => {
    render(
      <UserForm
        user={null}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /создать сотрудника/i }))

    await waitFor(() => {
      expect(screen.getByText(/имя обязательно/i)).toBeInTheDocument()
      expect(screen.getByText(/фамилия обязательна/i)).toBeInTheDocument()
      expect(screen.getByText(/email обязателен/i)).toBeInTheDocument()
      expect(screen.getByText(/телефон обязателен/i)).toBeInTheDocument()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })

  test('отклоняет отправку формы с некорректным email', async () => {
    const user = userEvent.setup()
    render(
      <UserForm
        user={null}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    // Заполняем форму с очевидно неверным email (без @ символа)
    await user.type(screen.getByLabelText(/имя/i), 'Test')
    await user.type(screen.getByLabelText(/фамилия/i), 'User')
    await user.type(screen.getByLabelText(/e-mail/i), 'invalidemail') // Очевидно неверный формат
    await user.type(screen.getByLabelText(/телефон/i), '77777777777')

    // Отправляем форму
    await user.click(screen.getByRole('button', { name: /создать сотрудника/i }))

    // Важно: mockSubmit не должен быть вызван
    await waitFor(() => {
      expect(mockSubmit).not.toHaveBeenCalled()
    })
  })

  test('проверяет что телефон не может быть пустым', async () => {
    const user = userEvent.setup()
    render(
      <UserForm
        user={null}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    await user.type(screen.getByLabelText(/имя/i), 'Test')
    await user.type(screen.getByLabelText(/фамилия/i), 'User')
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    // Не вводим телефон, оставляем поле пустым

    await user.click(screen.getByRole('button', { name: /создать сотрудника/i }))

    await waitFor(() => {
      expect(screen.getByText(/телефон обязателен/i)).toBeInTheDocument()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })

  test('проверяет формат номера телефона', async () => {
    const user = userEvent.setup()

    render(
      <UserForm
        user={null}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    // Заполняем обязательные поля
    await user.type(screen.getByLabelText(/имя/i), 'Test')
    await user.type(screen.getByLabelText(/фамилия/i), 'User')
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')

    // Вводим некорректный телефон - короткий
    await user.type(screen.getByLabelText(/телефон/i), '123456')

    // Отправляем форму
    await user.click(screen.getByRole('button', { name: /создать сотрудника/i }))

    // Проверяем наличие ошибки валидации
    await waitFor(() => {
      const phoneInput = screen.getByLabelText(/телефон/i)
      expect(phoneInput).toHaveClass('inputError')

      // Используем более точный запрос для поиска сообщения об ошибке, ищем только среди элементов с классом errorText
      const errorText = screen.getByText(
        (content, element) => {
          return element?.className === 'errorText' && /телефон|цифр/i.test(content);
        }
      );
      expect(errorText).toBeInTheDocument()
    })

    expect(mockSubmit).not.toHaveBeenCalled()
  })

  test('отправляет форму с корректными данными', async () => {
    // Мокаем успешную отправку
    mockSubmit.mockResolvedValue(undefined)

    const user = userEvent.setup()
    const { container } = render(
      <UserForm
        user={null}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    // Заполняем все обязательные поля
    await user.type(screen.getByLabelText(/имя/i), 'Test')
    await user.type(screen.getByLabelText(/фамилия/i), 'User')
    await user.type(screen.getByLabelText(/отчество/i), 'Testovich')
    await user.type(screen.getByLabelText(/e-mail/i), 'test@example.com')
    await user.type(screen.getByLabelText(/телефон/i), '77777777777')

    // Выбираем опции из выпадающих списков
    await user.selectOptions(screen.getByLabelText(/подразделение/i), 'surgery')
    await user.selectOptions(screen.getByLabelText(/административная должность/i), 'director')
    await user.selectOptions(screen.getByLabelText(/медицинская должность/i), 'dentist')

    // Включаем чекбокс электронной подписи
    await user.click(screen.getByLabelText(/простая электронная подпись/i))

    // Проверяем, что ошибок нет перед отправкой
    const errorElements = container.querySelectorAll(`.${styles.errorText}`)
    expect(errorElements.length).toBe(0)

    // Отправляем форму
    await user.click(screen.getByRole('button', { name: /создать сотрудника/i }))

    // Проверяем, что функция отправки была вызвана
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })

    // Проверяем корректность отправленных данных
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test',
        surname: 'User',
        patronymic: 'Testovich',
        email: 'test@example.com',
        phone: '77777777777',
        department: 'surgery',
        administrative_position: 'director',
        medical_position: 'dentist',
        is_simple_digital_sign_enabled: true,
      })
    )
  })

  test('отображает состояние загрузки во время отправки', async () => {
    // Мокаем долгую отправку
    mockSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <UserForm
        user={mockUser}
        onSubmit={mockSubmit}
        departments={mockDepartments}
        administrativePositions={mockAdminPositions}
        medicalPositions={mockMedicalPositions}
      />
    )

    // Запускаем отправку
    fireEvent.click(screen.getByRole('button', { name: /сохранить изменения/i }))

    // Проверяем, что кнопка изменила свой текст на "Сохранение..."
    expect(await screen.findByText(/сохранение/i)).toBeInTheDocument()

    // Ждем завершения отправки
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1)
    })
  })
})