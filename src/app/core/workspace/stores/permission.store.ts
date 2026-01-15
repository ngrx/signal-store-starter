import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import {
  PermissionStoreState,
  WorkspacePermission,
  initialPermissionStoreState,
} from '../state/permission.state';
import { PermissionsService } from '../services/permissions.service';

export const PermissionStore = signalStore(
  { providedIn: 'root' },
  withState<PermissionStoreState>(initialPermissionStoreState),
  withComputed(({ byWorkspace, currentWorkspaceId, loading }) => ({
    permissions: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return [];
      return byWorkspace()[id] ?? [];
    }),
    isLoading: computed(() => loading()),
  })),
  withMethods((store, permissionsService = inject(PermissionsService)) => {
    const loadEffect = rxMethod<string>(
      pipe(
        tap((workspaceId) =>
          patchState(store, { currentWorkspaceId: workspaceId, loading: true, error: null })
        ),
        switchMap((workspaceId) =>
          permissionsService.getPermissions(workspaceId).pipe(
            tap((items) => {
              const next = { ...store.byWorkspace(), [workspaceId]: items };
              patchState(store, { byWorkspace: next, loading: false });
            }),
            catchError((err) => {
              patchState(store, { error: err.message || 'Load failed', loading: false });
              return of([]);
            })
          )
        )
      )
    );

    return {
      loadForWorkspace(workspaceId: string) {
        loadEffect(workspaceId);
      },
      setPermissions(workspaceId: string, items: WorkspacePermission[]) {
        const next = { ...store.byWorkspace(), [workspaceId]: items };
        patchState(store, { byWorkspace: next, currentWorkspaceId: workspaceId });
      },
    };
  })
);
