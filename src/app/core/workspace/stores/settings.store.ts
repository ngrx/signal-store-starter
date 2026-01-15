import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { WorkspaceSettings } from '../models/workspace.model';
import { WorkspaceSettingsService } from '../services/workspace-settings.service';
import { WorkspaceStore } from './workspace.store';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';

interface SettingsState {
  settings: WorkspaceSettings;
  status: 'idle' | 'loading' | 'saving';
  error: string | null;
}

const fallbackSettings: WorkspaceSettings = {
  notifications: true,
  theme: 'system',
  defaultWorkspaceId: null,
  preferences: { compactView: false, auditEmails: false },
};

export const SettingsStore = signalStore(
  { providedIn: 'root' },
  withState<SettingsState>({
    settings: fallbackSettings,
    status: 'idle',
    error: null,
  }),
  withComputed(({ settings, status }) => ({
    isLoading: computed(() => status() === 'loading'),
    isSaving: computed(() => status() === 'saving'),
    currentTheme: computed(() => settings().theme),
  })),
  withMethods(
    (
      store,
      service = inject(WorkspaceSettingsService),
      workspaceStore = inject(WorkspaceStore)
    ) => {
      const loadEffect = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' as const })),
          switchMap(() => {
            const workspace = workspaceStore.activeWorkspace();
            return service.load(workspace?.id ?? null);
          }),
          tap((settings) => patchState(store, { settings, status: 'idle' })),
          catchError((error) => {
            patchState(store, {
              status: 'idle',
              error: error?.message || 'Failed to load settings',
            });
            return of(fallbackSettings);
          })
        )
      );

      return {
        load(): void {
          loadEffect();
        },
        update(partial: Partial<WorkspaceSettings>): void {
          const merged = { ...store.settings(), ...partial };
          patchState(store, { settings: merged, status: 'saving' });
          service.save(merged);
          patchState(store, { status: 'idle', error: null });
        },
      };
    }
  )
);
