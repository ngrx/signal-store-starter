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
  DocumentStoreState,
  WorkspaceDocument,
  initialDocumentStoreState,
} from '../state/document.state';
import { DocumentService } from '../services/document.service';

export const DocumentStore = signalStore(
  { providedIn: 'root' },
  withState<DocumentStoreState>(initialDocumentStoreState),
  withComputed(({ byWorkspace, currentWorkspaceId, loading }) => ({
    documents: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return [];
      return byWorkspace()[id] ?? [];
    }),
    isLoading: computed(() => loading()),
  })),
  withMethods((store, documentService = inject(DocumentService)) => {
    const loadEffect = rxMethod<string>(
      pipe(
        tap((workspaceId) =>
          patchState(store, { currentWorkspaceId: workspaceId, loading: true, error: null })
        ),
        switchMap((workspaceId) =>
          documentService.getDocuments(workspaceId).pipe(
            tap((docs) => {
              const next = { ...store.byWorkspace(), [workspaceId]: docs };
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
      setDocuments(workspaceId: string, docs: WorkspaceDocument[]) {
        const next = { ...store.byWorkspace(), [workspaceId]: docs };
        patchState(store, { byWorkspace: next, currentWorkspaceId: workspaceId });
      },
    };
  })
);
