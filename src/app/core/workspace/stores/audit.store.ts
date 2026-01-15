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
import { AuditEntry } from '../models/workspace.model';
import { AuditLogService } from '../services/audit-log.service';
import { WorkspaceStore } from './workspace.store';
import { AuthStore } from '../../auth/stores/auth.store';

interface AuditState {
  items: AuditEntry[];
  status: 'idle' | 'loading';
  error: string | null;
}

export const AuditStore = signalStore(
  { providedIn: 'root' },
  withState<AuditState>({ items: [], status: 'idle', error: null }),
  withComputed(({ items, status }) => ({
    isLoading: computed(() => status() === 'loading'),
    hasItems: computed(() => items().length > 0),
  })),
  withMethods(
    (
      store,
      service = inject(AuditLogService),
      workspaceStore = inject(WorkspaceStore),
      authStore = inject(AuthStore)
    ) => {
      const loadEffect = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' as const })),
          switchMap(() => {
            const workspace = workspaceStore.activeWorkspace();
            if (!workspace) return of<AuditEntry[]>([]);
            return service.list(workspace.id);
          }),
          tap((items) => patchState(store, { items, status: 'idle', error: null })),
          catchError((error) => {
            patchState(store, {
              status: 'idle',
              error: error?.message || 'Failed to load audit log',
            });
            return of([]);
          })
        )
      );

      return {
        load(): void {
          loadEffect();
        },
        record(action: string, target: string): void {
          const workspace = workspaceStore.activeWorkspace();
          const actor = authStore.user();
          if (!workspace || !actor) return;
          const entry: AuditEntry = {
            id: `${Date.now()}`,
            workspaceId: workspace.id,
            actor: actor.email || actor.uid,
            action,
            target,
            timestamp: Date.now(),
          };
          service.record(entry);
          patchState(store, (state) => ({ items: [entry, ...state.items] }));
        },
      };
    }
  )
);
