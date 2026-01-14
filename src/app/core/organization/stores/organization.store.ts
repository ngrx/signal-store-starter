import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { initialOrganizationState } from './organization.state';

export const OrganizationStore = signalStore(
  { providedIn: 'root' },
  withState(initialOrganizationState),
  withComputed(({ currentOrganization, organizations, loading }) => ({
    hasOrganization: computed(() => currentOrganization() !== null),
    organizationCount: computed(() => organizations().length),
    isLoading: computed(() => loading()),
  })),
  withMethods((store) => ({
    setCurrentOrganization(organization: any) {
      patchState(store, { currentOrganization: organization });
    },
    setOrganizations(organizations: any[]) {
      patchState(store, { organizations });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
  }))
);
