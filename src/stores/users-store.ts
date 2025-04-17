import { makeAutoObservable, runInAction } from 'mobx';
import { apiClient } from '../api/api-client';
import { CreateUserDto, UpdateUserDto, User, UsersResponse, UserResponse } from '../models/user';

class UsersStore {
  users: User[] = [];
  selectedUser: User | null = null;
  isLoading = false;
  error: string | null = null;
  totalItems = 0;
  currentPage = 1;
  perPage = 5;
  searchQuery = '';
  sortField = 'id';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  private loadFromStorage() {
    const searchQuery = localStorage.getItem('searchQuery') || '';
    const sortField = localStorage.getItem('sortField') || 'id';
    const sortDirection = (localStorage.getItem('sortDirection') || 'asc') as 'asc' | 'desc';
    const currentPage = Number(localStorage.getItem('currentPage')) || 1;

    this.searchQuery = searchQuery;
    this.sortField = sortField;
    this.sortDirection = sortDirection;
    this.currentPage = currentPage;
  }

  private saveToStorage() {
    localStorage.setItem('searchQuery', this.searchQuery);
    localStorage.setItem('sortField', this.sortField);
    localStorage.setItem('sortDirection', this.sortDirection);
    localStorage.setItem('currentPage', String(this.currentPage));
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
    this.currentPage = 1;
    this.saveToStorage();
    this.fetchUsers();
  }

  setSorting(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.saveToStorage();
    this.fetchUsers();
  }

  setPage(page: number) {
    this.currentPage = page;
    this.saveToStorage();
    this.fetchUsers();
  }

  async fetchUsers() {
    this.isLoading = true;
    this.error = null;

    try {
      const sort = this.sortDirection === 'desc' ? `-${this.sortField}` : this.sortField;

      // Добавляем параметры для поиска и пагинации
      let url = `api/v1/users?sort=${sort}&page=${this.currentPage}`;

      // Добавляем параметр поиска, если он задан
      if (this.searchQuery) {
        url += `&filter[name]=${encodeURIComponent(this.searchQuery)}`;
      }

      const response = await apiClient
      .get(url)
      .json<UsersResponse>();

      runInAction(() => {
        this.users = response.data.items;
        this.totalItems = response.data.pagination.total;
        this.perPage = response.data.pagination.per_page;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
    }
  }

  async fetchUserById(id: number) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient
      .get(`api/v1/users/${id}`)
      .json<UserResponse>();

      runInAction(() => {
        this.selectedUser = response.data;
        this.isLoading = false;
      });

      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
      return null;
    }
  }

  async createUser(userData: CreateUserDto) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient
      .post('api/v1/users', { json: userData })
      .json<UserResponse>();

      runInAction(() => {
        this.isLoading = false;
        this.fetchUsers(); // Перезагружаем список пользователей
      });

      return response.data;
    } catch (error) {
      runInAction(() => {
        if (error instanceof Error) {
          this.error = error.message;
        } else {
          this.error = 'Unknown error';
        }
        this.isLoading = false;
      });

      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserDto) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient
      .put(`api/v1/users/${id}`, { json: userData })
      .json<UserResponse>();

      runInAction(() => {
        this.isLoading = false;
        this.fetchUsers(); // Перезагружаем список пользователей
      });

      return response.data;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
      return null;
    }
  }

  async deleteUser(id: number) {
    this.isLoading = true;
    this.error = null;

    try {
      await apiClient.delete(`api/v1/users/${id}`).json();

      runInAction(() => {
        this.isLoading = false;
        this.fetchUsers(); // Перезагружаем список пользователей
      });

      return true;
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
      return false;
    }
  }
}

export const usersStore = new UsersStore();