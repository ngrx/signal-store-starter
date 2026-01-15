import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore, AuthStoreInstance } from '../../auth/stores/auth.store';
import { ContextStore, ContextStoreInstance } from '../../context/stores/context.store';
import {
  WorkspaceStore,
  WorkspaceStoreInstance,
  workspaceFromContext,
  workspaceIdFromContext,
} from '../stores/workspace.store';
import { AppContext } from '../../context/models/context.model';

export const workspaceContextGuard: CanActivateFn = (route) => {
  const workspaceStore = inject<WorkspaceStoreInstance>(WorkspaceStore);
  const contextStore = inject<ContextStoreInstance>(ContextStore);
  const authStore = inject<AuthStoreInstance>(AuthStore);
  const router = inject(Router);

  const workspaceId = route.params['workspaceId'] as string | undefined;

  if (!workspaceId) {
    const current = workspaceStore.currentWorkspace();
    if (current) {
      return router.createUrlTree(['/workspace', current.id, 'overview']);
    }

    const user = authStore.user();
    if (user) {
      const personalContext: AppContext = {
        type: 'user',
        userId: user.uid,
        email: user.email || '',
        displayName: user.displayName ?? null,
      };
      const workspace = workspaceFromContext(personalContext);
      workspaceStore.upsertWorkspace(workspace);
      workspaceStore.setCurrentWorkspace(workspace);
      return router.createUrlTree(['/workspace', workspace.id, 'overview']);
    }

    return router.createUrlTree(['/login']);
  }

  const existing = workspaceStore.workspaceById()[workspaceId];
  if (existing) {
    workspaceStore.setCurrentWorkspaceById(workspaceId);
    return true;
  }

  const contexts: AppContext[] = [];
  const current = contextStore.current();
  if (current) contexts.push(current);
  const available = contextStore.available();
  contexts.push(...available.organizations, ...available.teams, ...available.partners);

  const match = contexts.find((ctx) => workspaceIdFromContext(ctx) === workspaceId);
  if (match) {
    const workspace = workspaceFromContext(match);
    workspaceStore.upsertWorkspace(workspace);
    workspaceStore.setCurrentWorkspace(workspace);
    if (contextStore.current()?.type !== match.type || workspaceIdFromContext(contextStore.current()!) !== workspaceId) {
      contextStore.switchContext(match);
    }
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};
