import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from './stores/store-context';
import UsersTable from './components/UsersTable/UsersTable';
import UserForm from './components/UserForm/UserForm';
import SearchBar from './components/SearchBar/SearchBar';
import Modal from './components/Modal/Modal';
import UserDetails from './components/UserDetails/UserDetails';
import './styles/global.css';
import styles from './App.module.css';

const App = observer(() => {
  const { usersStore, referenceStore } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'details' | 'create' | 'edit'>('details');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    // Загружаем пользователей и справочники при инициализации
    usersStore.fetchUsers();
    referenceStore.fetchAllReferences();
  }, [usersStore, referenceStore]);

  const handleOpenDetailsModal = (userId: number) => {
    setSelectedUserId(userId);
    setModalType('details');
    setIsModalOpen(true);
    usersStore.fetchUserById(userId);
  };

  const handleOpenCreateModal = () => {
    setSelectedUserId(null);
    setModalType('create');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (userId: number) => {
    setSelectedUserId(userId);
    setModalType('edit');
    setIsModalOpen(true);
    usersStore.fetchUserById(userId);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      await usersStore.deleteUser(userId);
    }
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Список сотрудников клиники</h1>
        <div className={styles.actions}>
          <SearchBar
            value={usersStore.searchQuery}
            onChange={(value) => usersStore.setSearchQuery(value)}
          />
          <button className={styles.addButton} onClick={handleOpenCreateModal}>
            Добавить сотрудника
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <UsersTable
          users={usersStore.users}
          isLoading={usersStore.isLoading}
          error={usersStore.error}
          onDetailsClick={handleOpenDetailsModal}
          onEditClick={handleOpenEditModal}
          onDeleteClick={handleDeleteUser}
          sortField={usersStore.sortField}
          sortDirection={usersStore.sortDirection}
          onSort={(field) => usersStore.setSorting(field)}
          currentPage={usersStore.currentPage}
          totalPages={Math.ceil(usersStore.totalItems / usersStore.perPage)}
          onPageChange={(page) => usersStore.setPage(page)}
        />
      </main>

      {isModalOpen && (
        <Modal onClose={handleCloseModal} title={
          modalType === 'details'
            ? 'Информация о сотруднике'
            : modalType === 'create'
              ? 'Добавление сотрудника'
              : 'Редактирование сотрудника'
        }>
          {modalType === 'details' && usersStore.selectedUser && (
            <UserDetails user={usersStore.selectedUser} />
          )}
          {(modalType === 'create' || modalType === 'edit') && (
            <UserForm
              user={modalType === 'edit' ? usersStore.selectedUser : null}
              onSubmit={async (userData) => {
                try {
                  if (modalType === 'create') {
                    await usersStore.createUser(userData);
                  } else if (selectedUserId) {
                    await usersStore.updateUser(selectedUserId, userData);
                  }
                  // Закрываем модалку только если операция прошла успешно
                  handleCloseModal();
                } catch (error) {
                  // Не закрываем модалку при ошибке, обработка ошибки происходит в компоненте UserForm
                  console.error('Error submitting form:', error);
                }
              }}
              departments={referenceStore.departments}
              administrativePositions={referenceStore.getAdministrativePositions()}
              medicalPositions={referenceStore.getMedicalPositions()}
              serverError={usersStore.error} // Передаем ошибку с сервера в компонент формы
            />
          )}
        </Modal>
      )}
    </div>
  );
});

export default App;