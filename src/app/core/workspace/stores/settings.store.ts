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
  SettingsStoreState,
  WorkspaceSettingsState,
  initialSettingsStoreState,
} from '../state/settings.state';
import { SettingsService } from '../services/settings.service';

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState<SettingsStoreState>(initialSettingsStoreState),
  withComputed(({ byWorkspace, currentWorkspaceId, loading }) => ({
    settings: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return null;
      return byWorkspace()[id] ?? null;
    }),
    isLoading: computed(() => loading()),
  })),
  withMethods((store, settingsService = inject(SettingsService)) => {
    const loadEffect = rxMethod<string>(
      pipe(
        tap((workspaceId) =>
          patchState(store, { currentWorkspaceId: workspaceId, loading: true, error: null })
        ),
        switchMap((workspaceId) =>
          settingsService.getSettings(workspaceId).pipe(
            tap((settings) => {
              const next = { ...store.byWorkspace(), [workspaceId]: settings };
              patchState(store, { byWorkspace: next, loading: false });
            }),
            catchError((err) => {
              patchState(store, { error: err.message || 'Load failed', loading: false });
              return of(null);
            })
          )
        )
      )
    );

    return {
      loadForWorkspace(workspaceId: string) {
        loadEffect(workspaceId);
      },
      setSettings(workspaceId: string, settings: WorkspaceSettingsState) {
        const next = { ...store.byWorkspace(), [workspaceId]: settings };
        patchState(store, { byWorkspace: next, currentWorkspaceId: workspaceId });
      },
    };
  })
);
