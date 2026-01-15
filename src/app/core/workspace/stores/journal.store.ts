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
import { JournalEntry } from '../models/workspace.model';
import { JournalService } from '../services/journal.service';
import { WorkspaceStore } from './workspace.store';
import { AuthStore } from '../../auth/stores/auth.store';

interface JournalState {
  entries: JournalEntry[];
  status: 'idle' | 'loading';
  error: string | null;
}

export const JournalStore = signalStore(
  { providedIn: 'root' },
  withState<JournalState>({ entries: [], status: 'idle', error: null }),
  withComputed(({ entries, status }) => ({
    isLoading: computed(() => status() === 'loading'),
    hasEntries: computed(() => entries().length > 0),
  })),
  withMethods(
    (
      store,
      service = inject(JournalService),
      workspaceStore = inject(WorkspaceStore),
      authStore = inject(AuthStore)
    ) => {
      const loadEffect = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { status: 'loading' as const })),
          switchMap(() => {
            const workspace = workspaceStore.activeWorkspace();
            if (!workspace) return of<JournalEntry[]>([]);
            return service.list(workspace.id);
          }),
          tap((entries) => patchState(store, { entries, status: 'idle', error: null })),
          catchError((error) => {
            patchState(store, {
              status: 'idle',
              error: error?.message || 'Failed to load journal',
            });
            return of([]);
          })
        )
      );

      return {
        load(): void {
          loadEffect();
        },
        add(title: string, body: string): void {
          const workspace = workspaceStore.activeWorkspace();
          const author = authStore.user();
          if (!workspace || !author) return;
          const entry: JournalEntry = {
            id: `${Date.now()}`,
            workspaceId: workspace.id,
            author: author.email || author.uid,
            title,
            body,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            version: 1,
          };
          service.add(entry);
          patchState(store, (state) => ({ entries: [entry, ...state.entries] }));
        },
        edit(entryId: string, title: string, body: string): void {
          const current = store.entries().find((e) => e.id === entryId);
          if (!current) return;
          const updated: JournalEntry = {
            ...current,
            title,
            body,
            updatedAt: Date.now(),
            version: current.version + 1,
          };
          service.update(updated);
          patchState(store, (state) => ({
            entries: state.entries.map((e) => (e.id === entryId ? updated : e)),
          }));
        },
      };
    }
  )
);
