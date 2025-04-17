import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { User } from '../../models/user';
import styles from './UserDetails.module.css';

interface UserDetailsProps {
  user: User;
}

const UserDetails = ({ user }: UserDetailsProps) => {
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '—';
    return format(new Date(timestamp * 1000), 'dd.MM.yyyy', { locale: ru });
  };

  return (
    <div className={styles.userDetails}>
      <h2 className={styles.fullName}>
        {`${user.surname} ${user.name} ${user.patronymic}`}
      </h2>

      <div className={styles.infoSection}>
        <div className={styles.infoGroup}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Фамилия</span>
            <span className={styles.infoValue}>{user.surname}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Имя</span>
            <span className={styles.infoValue}>{user.name}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Отчество</span>
            <span className={styles.infoValue}>{user.patronymic}</span>
          </div>
        </div>

        <div className={styles.infoGroup}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Административная должность</span>
            <span className={styles.infoValue}>
              {user.administrative_position?.label || '—'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Медицинская должность</span>
            <span className={styles.infoValue}>
              {user.medical_position?.label || '—'}
            </span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Подразделение</span>
            <span className={styles.infoValue}>
              {user.department?.label || '—'}
            </span>
          </div>
        </div>

        <div className={styles.infoGroup}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Телефон</span>
            <span className={styles.infoValue}>{user.phone}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>E-mail</span>
            <span className={styles.infoValue}>{user.email}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Статус</span>
            <span className={`${styles.statusBadge} ${styles[user.status.value]}`}>
              {user.status.label}
            </span>
          </div>
        </div>

        <div className={styles.infoGroup}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Дата принятия на работу</span>
            <span className={styles.infoValue}>{formatDate(user.hired_at)}</span>
          </div>

          {user.fired_at && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Дата увольнения</span>
              <span className={styles.infoValue}>{formatDate(user.fired_at)}</span>
            </div>
          )}

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Простая электронная подпись</span>
            <span className={styles.infoValue}>
              {user.is_simple_digital_sign_enabled ? 'Включена' : 'Отключена'}
            </span>
          </div>
        </div>

        {user.roles.length > 0 && (
          <div className={styles.infoGroup}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Роли</span>
              <div className={styles.rolesList}>
                {user.roles.map(role => (
                  <span key={role.value} className={styles.roleBadge}>
                    {role.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetails;