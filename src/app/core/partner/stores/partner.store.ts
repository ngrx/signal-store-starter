import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { initialPartnerState } from './partner.state';

export const PartnerStore = signalStore(
  { providedIn: 'root' },
  withState(initialPartnerState),
  withComputed(({ partners, selectedPartner, loading }) => ({
    hasPartners: computed(() => partners().length > 0),
    partnerCount: computed(() => partners().length),
    isLoading: computed(() => loading()),
    hasSelectedPartner: computed(() => selectedPartner() !== null),
  })),
  withMethods((store) => ({
    setPartners(partners: any[]) {
      patchState(store, { partners });
    },
    setSelectedPartner(partner: any) {
      patchState(store, { selectedPartner: partner });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
  }))
);
