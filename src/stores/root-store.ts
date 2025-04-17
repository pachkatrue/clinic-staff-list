import { usersStore } from './users-store';
import { referenceStore } from './reference-store';

export const rootStore = {
  usersStore,
  referenceStore,
};

export type RootStore = typeof rootStore;