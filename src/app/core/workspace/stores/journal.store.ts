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
  JournalEntry,
  initialJournalStoreState,
} from '../state/journal.state';
import { JournalService } from '../services/journal.service';

export const JournalStore = signalStore(
  { providedIn: 'root' },
  withState(initialJournalStoreState),
  withComputed(({ byWorkspace, currentWorkspaceId, loading }) => ({
    entries: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return [];
      return byWorkspace()[id] ?? [];
    }),
    isLoading: computed(() => loading()),
  })),
  withMethods((store, journalService = inject(JournalService)) => {
    const loadEffect = rxMethod<string>(
      pipe(
        tap((workspaceId) =>
          patchState(store, { currentWorkspaceId: workspaceId, loading: true, error: null })
        ),
        switchMap((workspaceId) =>
          journalService.getEntries(workspaceId).pipe(
            tap((entries) => {
              const next = { ...store.byWorkspace(), [workspaceId]: entries };
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
      setEntries(workspaceId: string, entries: JournalEntry[]) {
        const next = { ...store.byWorkspace(), [workspaceId]: entries };
        patchState(store, { byWorkspace: next, currentWorkspaceId: workspaceId });
      },
    };
  })
);
