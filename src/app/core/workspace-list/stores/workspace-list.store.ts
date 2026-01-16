/**
 * WorkspaceListStore - NgRx Signals store for workspace collection management
 * WorkspaceList = AccountWorkspaces (OwnedWorkspaces | MemberWorkspaces | ArchivedWorkspaces)
 * Per prd-sup.md section on WorkspaceListStore
 */

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { initialWorkspaceListState } from '../state/workspace-list.state';
import { WorkspaceListItem, RecentWorkspace, FavoriteWorkspace } from '../models/workspace-list.model';
import { WorkspaceListService } from '../services/workspace-list.service';
import { AuthStore } from '../../auth/stores/auth.store';

export const WorkspaceListStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceListState),
  withComputed(({ workspaces, workspaceById, currentWorkspaceId, recentWorkspaces, favoriteWorkspaces, loading }) => ({
    // Filtered workspace lists per prd-sup.md
    ownedWorkspaces: computed(() => 
      workspaces().filter(w => w.membership?.role === 'Owner')
    ),

    memberWorkspaces: computed(() => 
      workspaces().filter(w => 
        w.membership?.role && 
        ['Admin', 'Member', 'Guest'].includes(w.membership.role)
      )
    ),

    archivedWorkspaces: computed(() => 
      workspaces().filter(w => w.membership?.status === 'Archived')
    ),

    activeWorkspaces: computed(() => 
      workspaces().filter(w => w.membership?.status === 'Active')
    ),

    // Current workspace
    currentWorkspace: computed(() => {
      const id = currentWorkspaceId();
      return id ? workspaceById()[id] ?? null : null;
    }),

    // Recent workspaces (last 5)
    recentWorkspacesList: computed(() => 
      recentWorkspaces()
        .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
        .slice(0, 5)
    ),

    // Favorite workspaces (sorted by order)
    favoriteWorkspacesList: computed(() => 
      favoriteWorkspaces().sort((a, b) => a.order - b.order)
    ),

    // Statistics
    totalWorkspaces: computed(() => workspaces().length),
    ownedWorkspacesCount: computed(() => 
      workspaces().filter(w => w.membership?.role === 'Owner').length
    ),
    memberWorkspacesCount: computed(() => 
      workspaces().filter(w => 
        w.membership?.role && 
        ['Admin', 'Member', 'Guest'].includes(w.membership.role)
      ).length
    ),

    // Checks
    hasWorkspaces: computed(() => workspaces().length > 0),
    hasOwnedWorkspaces: computed(() => 
      workspaces().some(w => w.membership?.role === 'Owner')
    ),
    canCreateWorkspace: computed(() => true), // Could check quota here

    // Loading state
    isLoading: computed(() => loading()),
  })),
  withMethods((store, workspaceListService = inject(WorkspaceListService)) => {
    // We'll inject AuthStore in the methods that need it to avoid circular dependency
    const getAuthStore = () => inject(AuthStore);
    
    /**
     * Load workspaces for current user
     */
    const loadWorkspaces = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const authStore = getAuthStore();
          const user = authStore.user();
          if (!user) {
            patchState(store, { loading: false, error: 'No authenticated user' });
            return of([]);
          }

          return workspaceListService.getWorkspaces(user.uid).pipe(
            tap((workspaces) => {
              const workspaceMap = workspaces.reduce<Record<string, WorkspaceListItem>>((acc, ws) => {
                acc[ws.id] = ws;
                return acc;
              }, {});

              patchState(store, {
                workspaces,
                workspaceById: workspaceMap,
                loading: false,
              });
            }),
            catchError((err) => {
              patchState(store, {
                error: err.message || 'Failed to load workspaces',
                loading: false,
              });
              return of([]);
            })
          );
        })
      )
    );

    /**
     * Create new workspace
     */
    const createWorkspace = rxMethod<Omit<WorkspaceListItem, 'id'>>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((workspace) =>
          workspaceListService.createWorkspace(workspace).pipe(
            tap((workspaceId) => {
              patchState(store, { loading: false });
              // Reload workspaces to get the updated list
              loadWorkspaces();
            }),
            catchError((err) => {
              patchState(store, {
                error: err.message || 'Failed to create workspace',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Archive workspace
     */
    const archiveWorkspace = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((workspaceId) =>
          workspaceListService.archiveWorkspace(workspaceId).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload workspaces
              loadWorkspaces();
            }),
            catchError((err) => {
              patchState(store, {
                error: err.message || 'Failed to archive workspace',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Leave workspace
     */
    const leaveWorkspace = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((workspaceId) => {
          const authStore = getAuthStore();
          const user = authStore.user();
          if (!user) {
            patchState(store, { loading: false, error: 'No authenticated user' });
            return of(null);
          }

          return workspaceListService.leaveWorkspace(workspaceId, user.uid).pipe(
            tap(() => {
              patchState(store, { loading: false, currentWorkspaceId: null });
              // Reload workspaces
              loadWorkspaces();
            }),
            catchError((err) => {
              patchState(store, {
                error: err.message || 'Failed to leave workspace',
                loading: false,
              });
              return of(null);
            })
          );
        })
      )
    );

    /**
     * Toggle favorite workspace
     */
    const toggleFavorite = rxMethod<{ workspaceId: string; isFavorite: boolean }>(
      pipe(
        switchMap(({ workspaceId, isFavorite }) => {
          const authStore = getAuthStore();
          const user = authStore.user();
          if (!user) return of(null);

          return workspaceListService.toggleFavorite(workspaceId, user.uid, isFavorite).pipe(
            tap(() => {
              // Update local state
              const workspace = store.workspaceById()[workspaceId];
              if (workspace) {
                const updated = { ...workspace, isFavorite };
                const workspaceMap = { ...store.workspaceById(), [workspaceId]: updated };
                const workspaceList = Object.values(workspaceMap);
                
                patchState(store, {
                  workspaceById: workspaceMap,
                  workspaces: workspaceList,
                });
              }
            }),
            catchError(() => of(null))
          );
        })
      )
    );

    return {
      // Reactive effects
      loadWorkspaces,
      createWorkspace,
      archiveWorkspace,
      leaveWorkspace,
      toggleFavorite,

      // Synchronous state updates
      selectWorkspace(workspaceId: string | null) {
        patchState(store, { currentWorkspaceId: workspaceId });
        
        // Update last accessed time
        if (workspaceId) {
          const authStore = getAuthStore();
          const user = authStore.user();
          if (user) {
            workspaceListService.updateLastAccessed(workspaceId, user.uid).subscribe();
          }
        }
      },

      addWorkspace(workspace: WorkspaceListItem) {
        const workspaceMap = { ...store.workspaceById(), [workspace.id]: workspace };
        const workspaceList = Object.values(workspaceMap);
        
        patchState(store, {
          workspaceById: workspaceMap,
          workspaces: workspaceList,
        });
      },

      updateWorkspace(workspaceId: string, updates: Partial<WorkspaceListItem>) {
        const workspace = store.workspaceById()[workspaceId];
        if (!workspace) return;

        const updated = { ...workspace, ...updates };
        const workspaceMap = { ...store.workspaceById(), [workspaceId]: updated };
        const workspaceList = Object.values(workspaceMap);
        
        patchState(store, {
          workspaceById: workspaceMap,
          workspaces: workspaceList,
        });
      },

      removeWorkspace(workspaceId: string) {
        const workspaceMap = { ...store.workspaceById() };
        delete workspaceMap[workspaceId];
        const workspaceList = Object.values(workspaceMap);
        
        patchState(store, {
          workspaceById: workspaceMap,
          workspaces: workspaceList,
          currentWorkspaceId: store.currentWorkspaceId() === workspaceId ? null : store.currentWorkspaceId(),
        });
      },

      addToRecent(workspaceId: string) {
        const workspace = store.workspaceById()[workspaceId];
        if (!workspace) return;

        const recent: RecentWorkspace = {
          workspaceId,
          name: workspace.name,
          lastAccessedAt: new Date(),
          accessCount: 1,
        };

        const recentList = [
          recent,
          ...store.recentWorkspaces().filter(r => r.workspaceId !== workspaceId)
        ].slice(0, 10); // Keep only last 10

        patchState(store, { recentWorkspaces: recentList });
      },

      clearAll() {
        patchState(store, initialWorkspaceListState);
      },
    };
  }),
  withHooks({
    onInit(store) {
      // Auto-load workspaces when user is authenticated
      // We check in the AppComponent with an effect instead to avoid circular dependency
    },
  })
);
