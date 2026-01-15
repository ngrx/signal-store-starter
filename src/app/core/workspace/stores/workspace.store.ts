import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed } from '@angular/core';
import { initialWorkspaceState } from '../state/workspace.state';
import { Workspace } from '../models/workspace.model';

export const WorkspaceStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceState),
  withComputed(({ currentWorkspace, workspaces, loading, workspaceById }) => ({
    hasWorkspace: computed(() => currentWorkspace() !== null),
    workspaceCount: computed(() => workspaces().length),
    isLoading: computed(() => loading()),
    workspaceMap: computed(() => workspaceById()),
  })),
  withMethods((store) => ({
    setCurrentWorkspace(workspace: Workspace | null) {
      patchState(store, { currentWorkspace: workspace });
      if (workspace) {
        this.upsertWorkspace(workspace);
      }
    },
    setWorkspaces(workspaces: Workspace[]) {
      const map = workspaces.reduce<Record<string, Workspace>>((acc, ws) => {
        acc[ws.id] = ws;
        return acc;
      }, {});
      patchState(store, { workspaces, workspaceById: map });
    },
    upsertWorkspace(workspace: Workspace) {
      const current = store.workspaceById();
      const updated = { ...current, [workspace.id]: workspace };
      const list = Object.values(updated);
      patchState(store, { workspaceById: updated, workspaces: list });
    },
    setLoading(loading: boolean) {
      patchState(store, { loading });
    },
    setError(error: string | null) {
      patchState(store, { error });
    },
    ensurePersonalWorkspace() {
      const existing = store.workspaceById()['personal'];
      if (existing) {
        this.setCurrentWorkspace(existing);
        return;
      }
      const personal: Workspace = {
        id: 'personal',
        name: 'Personal Workspace',
        description: 'Your private space for tasks and documents',
        type: 'personal',
      };
      this.upsertWorkspace(personal);
      this.setCurrentWorkspace(personal);
    },
    clearAll() {
      patchState(store, initialWorkspaceState);
    },
  }))
);
