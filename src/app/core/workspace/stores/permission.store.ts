import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { PermissionsService } from '../services/permissions.service';
import { Capability, RoleMatrixRow } from '../models/workspace.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

interface PermissionState {
  roles: RoleMatrixRow[];
  status: 'idle' | 'loading';
  error: string | null;
}

export const PermissionStore = signalStore(
  { providedIn: 'root' },
  withState<PermissionState>({ roles: [], status: 'idle', error: null }),
  withComputed(({ roles, status }) => ({
    isLoading: computed(() => status() === 'loading'),
    capabilities: computed(() =>
      Array.from(new Set(roles().flatMap((r) => r.capabilities)))
    ),
  })),
  withMethods((store, service = inject(PermissionsService)) => {
    const loadEffect = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading' as const })),
        switchMap(() => service.list()),
        tap((roles) => patchState(store, { roles, status: 'idle', error: null })),
        catchError((error) => {
          patchState(store, {
            status: 'idle',
            error: error?.message || 'Failed to load permissions',
          });
          return of([]);
        })
      )
    );

    return {
      load(): void {
        loadEffect();
      },
      toggle(role: string, capability: Capability, enabled: boolean): void {
        service.toggle(role, capability, enabled);
        patchState(store, (state) => ({
          roles: state.roles.map((row) =>
            row.role !== role
              ? row
              : {
                  ...row,
                  capabilities: enabled
                    ? Array.from(new Set([...row.capabilities, capability]))
                    : row.capabilities.filter((cap) => cap !== capability),
                }
          ),
        }));
      },
    };
  })
);
