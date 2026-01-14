import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { initialWorkspaceState } from './workspace.state';

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceState),
  withComputed(({ currentWorkspace, workspaces, loading }) => ({
    hasWorkspace: computed(() => currentWorkspace() !== null),
    workspaceCount: computed(() => workspaces().length),
    isLoading: computed(() => loading()),
  })),
  withMethods((store) => ({
    setCurrentWorkspace(workspace: any) {
      patchState(store, { currentWorkspace: workspace });
    },
    setWorkspaces(workspaces: any[]) {
      patchState(store, { workspaces });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
  }))
);
