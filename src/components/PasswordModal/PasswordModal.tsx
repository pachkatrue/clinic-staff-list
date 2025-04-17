import { useState } from 'react';
import Modal from '../Modal/Modal';
import styles from './PasswordModal.module.css';

interface PasswordModalProps {
  onClose: () => void;
  onSubmit: (oldPassword: string, newPassword: string) => Promise<void>;
}

const PasswordModal = ({ onClose, onSubmit }: PasswordModalProps) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!oldPassword) {
      newErrors.oldPassword = 'Введите старый пароль';
    }

    if (!newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Пароль должен быть не короче 8 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(oldPassword, newPassword);
      onClose();
    } catch (error) {
      // Обрабатываем ошибки
      if (error instanceof Error) {
        setErrors({ form: error.message });
      } else {
        setErrors({ form: 'Произошла ошибка при смене пароля' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Изменение пароля" onClose={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="oldPassword" className={styles.label}>
            Введите старый пароль
          </label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={`${styles.input} ${errors.oldPassword ? styles.inputError : ''}`}
          />
          {errors.oldPassword && (
            <span className={styles.errorText}>{errors.oldPassword}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="newPassword" className={styles.label}>
            Введите новый пароль
          </label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={`${styles.input} ${errors.newPassword ? styles.inputError : ''}`}
          />
          {errors.newPassword && (
            <span className={styles.errorText}>{errors.newPassword}</span>
          )}
          <span className={styles.passwordHint}>Не короче 8 символов</span>
        </div>

        {errors.form && <div className={styles.formError}>{errors.form}</div>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить пароль'}
        </button>
      </form>
    </Modal>
  );
};

export default PasswordModal;