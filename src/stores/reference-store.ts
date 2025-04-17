import { makeAutoObservable, runInAction } from 'mobx';
import { apiClient } from '../api/api-client';
import { ValueLabel } from '../models/user';

interface ReferenceResponse {
  message: string;
  data: {
    items: ValueLabel[];
  };
}

class ReferenceStore {
  positions: ValueLabel[] = [];
  roles: ValueLabel[] = [];
  userStatuses: ValueLabel[] = [];
  departments: ValueLabel[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchAllReferences() {
    await Promise.all([
      this.fetchPositions(),
      this.fetchRoles(),
      this.fetchUserStatuses(),
      this.fetchDepartments(),
    ]);
  }

  async fetchPositions() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient
      .get('api/v1/positions')
      .json<ReferenceResponse>();

      runInAction(() => {
        this.positions = response.data.items;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
    }
  }

  async fetchRoles() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient
      .get('api/v1/roles')
      .json<ReferenceResponse>();

      runInAction(() => {
        this.roles = response.data.items;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
    }
  }

  async fetchUserStatuses() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient
      .get('api/v1/user-statuses')
      .json<ReferenceResponse>();

      runInAction(() => {
        this.userStatuses = response.data.items;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
    }
  }

  async fetchDepartments() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await apiClient
      .get('api/v1/departments')
      .json<ReferenceResponse>();

      runInAction(() => {
        this.departments = response.data.items;
        this.isLoading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error instanceof Error ? error.message : 'Unknown error';
        this.isLoading = false;
      });
    }
  }

  getPositionsByType(type: string): ValueLabel[] {
    return this.positions.filter(position => position.type === type);
  }

  getAdministrativePositions(): ValueLabel[] {
    return this.getPositionsByType('administrative');
  }

  getMedicalPositions(): ValueLabel[] {
    return this.getPositionsByType('medical');
  }
}

export const referenceStore = new ReferenceStore();