import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { initialTeamState } from './team.state';

export const TeamStore = signalStore(
  { providedIn: 'root' },
  withState(initialTeamState),
  withComputed(({ teams, selectedTeam, loading }) => ({
    hasTeams: computed(() => teams().length > 0),
    teamCount: computed(() => teams().length),
    isLoading: computed(() => loading()),
    hasSelectedTeam: computed(() => selectedTeam() !== null),
  })),
  withMethods((store) => ({
    setTeams(teams: any[]) {
      patchState(store, { teams });
    },
    setSelectedTeam(team: any) {
      patchState(store, { selectedTeam: team });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
  }))
);
