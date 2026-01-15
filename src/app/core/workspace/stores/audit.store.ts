import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, of, catchError } from 'rxjs';
import {
  AuditLogEntry,
  initialAuditStoreState,
} from '../state/audit.state';
import { AuditLogService } from '../services/audit-log.service';

export const AuditStore = signalStore(
  { providedIn: 'root' },
  withState(initialAuditStoreState),
  withComputed(({ byWorkspace, currentWorkspaceId, loading }) => ({
    entries: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return [];
      return byWorkspace()[id] ?? [];
    }),
    isLoading: computed(() => loading()),
  })),
  withMethods((store, auditService = inject(AuditLogService)) => {
    const loadEffect = rxMethod<string>(
      pipe(
        tap((workspaceId) =>
          patchState(store, {
            currentWorkspaceId: workspaceId,
            loading: true,
            error: null,
          })
        ),
        switchMap((workspaceId) =>
          auditService.getAuditLog(workspaceId).pipe(
            tap((entries) => {
              const next = { ...store.byWorkspace(), [workspaceId]: entries };
              patchState(store, {
                byWorkspace: next,
                loading: false,
                currentWorkspaceId: workspaceId,
              });
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
      setEntries(workspaceId: string, entries: AuditLogEntry[]) {
        const next = { ...store.byWorkspace(), [workspaceId]: entries };
        patchState(store, { byWorkspace: next, currentWorkspaceId: workspaceId });
      },
    };
  })
);
