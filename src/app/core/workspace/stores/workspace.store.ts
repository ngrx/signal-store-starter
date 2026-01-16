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
import { AppContext } from '../../context/models/context.model';

export const workspaceIdFromContext = (context: AppContext): string => {
  switch (context.type) {
    case 'user':
      return `personal-${context.userId}`;
    case 'organization':
      return `org-${context.organizationId}`;
    case 'team':
      return `team-${context.teamId}`;
    case 'partner':
      return `partner-${context.partnerId}`;
    default:
      return 'workspace';
  }
};

export const workspaceFromContext = (context: AppContext): Workspace => {
  const id = workspaceIdFromContext(context);
  const contextRefType: 'personal' | 'organization' | 'team' | 'partner' =
    context.type === 'user' ? 'personal' : context.type;

  const name =
    context.type === 'user'
      ? context.displayName || context.email
      : context.name;

  return {
    id,
    name: name || 'Workspace',
    description: `${context.type} workspace`,
    // contextRef.type = ownership (personal/organization/team/partner)
    contextRef: { type: contextRefType, id },
    // workspace.type = category per prd-sup.md (defaults to 'internal')
    type: 'internal',
  };
};

const workspaceStore = signalStore(
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
    setCurrentWorkspaceById(workspaceId: string) {
      const target = store.workspaceById()[workspaceId] || null;
      patchState(store, { currentWorkspace: target });
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
        type: 'internal', // WorkspaceType per prd-sup.md
        contextRef: { type: 'personal', id: 'personal' },
      };
      this.upsertWorkspace(personal);
      this.setCurrentWorkspace(personal);
    },
    clearAll() {
      patchState(store, initialWorkspaceState);
    },
  }))
);

export type WorkspaceStoreInstance = InstanceType<typeof workspaceStore>;
export { workspaceStore as WorkspaceStore };
