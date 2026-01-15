import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { DocumentAsset } from '../models/workspace.model';
import { DocumentStorageService } from '../services/document-storage.service';
import { WorkspaceStore } from './workspace.store';
import { AuthStore } from '../../auth/stores/auth.store';

interface DocumentState {
  items: DocumentAsset[];
  uploading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  items: [],
  uploading: false,
  error: null,
};

export const DocumentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, uploading }) => ({
    hasDocuments: computed(() => items().length > 0),
    isUploading: computed(() => uploading()),
  })),
  withMethods(
    (
      store,
      storageService = inject(DocumentStorageService),
      workspaceStore = inject(WorkspaceStore),
      authStore = inject(AuthStore)
    ) => {
      const loadEffect = rxMethod<void>(
        pipe(
          switchMap(() => {
            const workspace = workspaceStore.activeWorkspace();
            if (!workspace) return of<DocumentAsset[]>([]);
            return storageService.list(workspace.contextId);
          }),
          tap((docs) => patchState(store, { items: docs, error: null })),
          catchError((error) => {
            patchState(store, { error: error?.message || 'Failed to load documents' });
            return of([]);
          })
        )
      );

      const uploadEffect = rxMethod<File>(
        pipe(
          tap(() => patchState(store, { uploading: true, error: null })),
          switchMap((file) => {
            const workspace = workspaceStore.activeWorkspace();
            const user = authStore.user();
            if (!workspace || !user) return of(null);
            return storageService.upload(workspace.contextId, file, user.uid);
          }),
          tap((doc) => {
            if (doc) {
              patchState(store, (state) => ({
                items: [doc, ...state.items],
                uploading: false,
              }));
            } else {
              patchState(store, { uploading: false });
            }
          }),
          catchError((error) => {
            patchState(store, {
              uploading: false,
              error: error?.message || 'Upload failed',
            });
            return of(null);
          })
        )
      );

      return {
        load(): void {
          loadEffect();
        },
        upload(file: File): void {
          uploadEffect(file);
        },
      };
    }
  )
);
