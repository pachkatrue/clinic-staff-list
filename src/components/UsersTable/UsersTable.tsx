import { observer } from 'mobx-react-lite';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Tooltip } from 'react-tooltip';
import { User } from '../../models/user';
import Pagination from '../Pagination/Pagination';
import styles from './UsersTable.module.css';

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onDetailsClick: (userId: number) => void;
  onEditClick: (userId: number) => void;
  onDeleteClick: (userId: number) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const UsersTable = observer(({
                               users,
                               isLoading,
                               error,
                               onDetailsClick,
                               onEditClick,
                               onDeleteClick,
                               sortField,
                               sortDirection,
                               onSort,
                               currentPage,
                               totalPages,
                               onPageChange,
                             }: UsersTableProps) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const renderFullName = (user: User) => {
    const fullName = `${user.surname} ${user.name} ${user.patronymic}`;
    return (
      <div
        data-tooltip-id={`user-tooltip-${user.id}`}
        data-tooltip-content={`Email: ${user.email}, Телефон: ${user.phone}`}
        className={styles.fullName}
      >
        {fullName}
        <Tooltip id={`user-tooltip-${user.id}`} />
      </div>
    );
  };

  const renderDate = (timestamp: number | null) => {
    if (!timestamp) return '—';
    return format(new Date(timestamp * 1000), 'dd.MM.yyyy', { locale: ru });
  };

  if (isLoading && users.length === 0) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (error && users.length === 0) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.tableContainer}>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
        <tr>
          <th onClick={() => onSort('id')}>
            ID {getSortIcon('id')}
          </th>
          <th onClick={() => onSort('surname')}>
            ФИО {getSortIcon('surname')}
          </th>
          <th>Должность</th>
          <th>Отдел</th>
          <th /* onClick={() => onSort('hired_at')} */>
            Дата найма {/* {getSortIcon('hired_at')} */}
            <span className={styles.nonSortableIcon} title="Сортировка недоступна">⚠️</span>
          </th>
          <th>Статус</th>
          <th>Действия</th>
        </tr>
        </thead>
        <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{renderFullName(user)}</td>
            <td>
              {user.administrative_position?.label || '—'}
              {user.administrative_position && user.medical_position ? ' / ' : ''}
              {user.medical_position?.label || ''}
            </td>
            <td>{user.department?.label || '—'}</td>
            <td>{renderDate(user.hired_at)}</td>
            <td>
                <span className={`${styles.status} ${styles[user.status.value]}`}>
                  {user.status.label}
                </span>
            </td>
            <td>
              <div className={styles.actions}>
                <button
                  className={`${styles.actionButton} ${styles.detailsButton}`}
                  onClick={() => onDetailsClick(user.id)}
                >
                  📄
                </button>
                <button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => onEditClick(user.id)}
                >
                  ✏️
                </button>
                <button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => onDeleteClick(user.id)}
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
});

export default UsersTable;