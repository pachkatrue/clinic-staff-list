import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale/ru';
import 'react-datepicker/dist/react-datepicker.css';
import { CreateUserDto, UpdateUserDto, User, ValueLabel } from '../../models/user';
import styles from './UserForm.module.css';

// Регистрируем русскую локализацию для DatePicker
registerLocale('ru', ru);

interface UserFormProps {
  user: User | null;
  onSubmit: (userData: CreateUserDto | UpdateUserDto) => Promise<void>;
  departments: ValueLabel[];
  administrativePositions: ValueLabel[];
  medicalPositions: ValueLabel[];
  serverError?: string | null;
}

const UserForm = observer(({
                             user,
                             onSubmit,
                             departments,
                             administrativePositions,
                             medicalPositions,
                             serverError,
                           }: UserFormProps) => {
  // Установка начальных значений
  const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
    name: user?.name || '',
    surname: user?.surname || '',
    patronymic: user?.patronymic || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department?.value || null,
    administrative_position: user?.administrative_position?.value || null,
    medical_position: user?.medical_position?.value || null,
    is_simple_digital_sign_enabled: user?.is_simple_digital_sign_enabled || false,
    hired_at: user?.hired_at || Math.floor(Date.now() / 1000),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обновление formData при изменении user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic,
        email: user.email,
        phone: user.phone,
        department: user.department?.value || null,
        administrative_position: user.administrative_position?.value || null,
        medical_position: user.medical_position?.value || null,
        is_simple_digital_sign_enabled: user.is_simple_digital_sign_enabled,
        hired_at: user.hired_at,
      });
    }
  }, [user]);

  useEffect(() => {
    if (serverError) {
      try {
        // Проверяем, является ли ошибка JSON с полями ошибок
        if (serverError.includes('{"message"')) {
          const errorObj = JSON.parse(serverError);
          const newErrors: Record<string, string> = {};

          // Обрабатываем ошибки для конкретных полей
          if (errorObj.errors) {
            Object.entries(errorObj.errors).forEach(([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                newErrors[field] = messages[0];
              }
            });
          }

          // Если есть общая ошибка
          if (errorObj.message) {
            newErrors.form = errorObj.message;
          }

          setErrors(prev => ({ ...prev, ...newErrors }));
        } else {
          // Простая строка ошибки
          setErrors(prev => ({ ...prev, form: serverError }));
        }
      } catch (e) {
        // Если не удалось разобрать JSON, просто показываем ошибку как есть
        setErrors(prev => ({ ...prev, form: serverError }));
      }
    }
  }, [serverError]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Фамилия обязательна';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Телефон должен содержать только цифры';
    } else if (formData.phone.length !== 11) {
      newErrors.phone = 'Телефон должен содержать 11 цифр';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean | null = value;

    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    }

    // Обработка телефонного номера - разрешаем только цифры и ограничиваем длину
    if (name === 'phone') {
      // Удаляем все нецифровые символы
      const digitsOnly = value.replace(/\D/g, '');
      // Ограничиваем до 11 цифр
      newValue = digitsOnly.slice(0, 11);
    }

    if (name === 'department' || name === 'administrative_position' || name === 'medical_position') {
      newValue = value || null;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        hired_at: Math.floor(date.getTime() / 1000),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {errors.form && (
        <div className={styles.formError}>
          {errors.form}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="surname" className={styles.label}>Фамилия</label>
        <input
          type="text"
          id="surname"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          className={`${styles.input} ${errors.surname ? styles.inputError : ''}`}
          placeholder="Введите фамилию"
        />
        {errors.surname && <span className={styles.errorText}>{errors.surname}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>Имя</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          placeholder="Введите имя"
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="patronymic" className={styles.label}>Отчество</label>
        <input
          type="text"
          id="patronymic"
          name="patronymic"
          value={formData.patronymic}
          onChange={handleChange}
          className={styles.input}
          placeholder="Введите отчество"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="administrative_position" className={styles.label}>
          Административная должность
        </label>
        <select
          id="administrative_position"
          name="administrative_position"
          value={formData.administrative_position || ''}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">Выберите должность</option>
          {administrativePositions.map(position => (
            <option key={position.value} value={position.value}>
              {position.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="medical_position" className={styles.label}>
          Медицинская должность
        </label>
        <select
          id="medical_position"
          name="medical_position"
          value={formData.medical_position || ''}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">Выберите должность</option>
          {medicalPositions.map(position => (
            <option key={position.value} value={position.value}>
              {position.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="department" className={styles.label}>Подразделение</label>
        <select
          id="department"
          name="department"
          value={formData.department || ''}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">Выберите подразделение</option>
          {departments.map(department => (
            <option key={department.value} value={department.value}>
              {department.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="phone" className={styles.label}>Телефон</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
          placeholder="+7 (___) ___ __ __"
        />
        {errors.phone ? (
          <span className={styles.errorText}>{errors.phone}</span>
        ) : (
          <span className={styles.inputHint}>Например: 79001234567</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>E-mail</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="Введите ваш E-mail"
        />
        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="hired_at" className={styles.label}>Дата принятия на работу</label>
        <DatePicker
          id="hired_at"
          selected={new Date(formData.hired_at * 1000)}
          onChange={handleDateChange}
          locale="ru"
          dateFormat="dd.MM.yyyy"
          className={styles.input}
          placeholderText="Выберите дату"
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            name="is_simple_digital_sign_enabled"
            checked={formData.is_simple_digital_sign_enabled}
            onChange={handleChange}
            className={styles.checkbox}
          />
          Простая электронная подпись
        </label>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Сохранение...' : user ? 'Сохранить изменения' : 'Создать сотрудника'}
      </button>
    </form>
  );
});

export default UserForm;