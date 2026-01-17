/**
 * WorkspaceListStore - NgRx Signals store for workspace collection management
 * WorkspaceList = AccountWorkspaces (OwnedWorkspaces | MemberWorkspaces | ArchivedWorkspaces)
 * Per prd-sup.md section on WorkspaceListStore
 */

import { computed, inject, effect } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { initialWorkspaceListState } from '../state/workspace-list.state';
import { WorkspaceListItem, RecentWorkspace, FavoriteWorkspace } from '../models/workspace-list.model';
import { WorkspaceListService } from '../services/workspace-list.service';
import { EventBusStore } from '../../event-bus/stores/event-bus.store';

export const WorkspaceListStore = signalStore(
  { providedIn: 'root' },
  withState(initialWorkspaceListState),
  withComputed((store) => ({
    // Filtered workspace lists per prd-sup.md
    ownedWorkspaces: computed(() => 
      store.workspaces().filter(w => w.membership?.role === 'Owner')
    ),

    memberWorkspaces: computed(() => 
      store.workspaces().filter(w => 
        w.membership?.role && 
        ['Admin', 'Member', 'Guest'].includes(w.membership.role)
      )
    ),

    archivedWorkspaces: computed(() => 
      store.workspaces().filter(w => w.membership?.status === 'Archived')
    ),

    activeWorkspaces: computed(() => 
      store.workspaces().filter(w => w.membership?.status === 'Active')
    ),

    // Workspaces by type (per prd-sup.md WorkspaceType enum)
    projectWorkspaces: computed(() => 
      store.workspaces().filter(w => w.type === 'project')
    ),

    departmentWorkspaces: computed(() => 
      store.workspaces().filter(w => w.type === 'department')
    ),

    clientWorkspaces: computed(() => 
      store.workspaces().filter(w => w.type === 'client')
    ),

    campaignWorkspaces: computed(() => 
      store.workspaces().filter(w => w.type === 'campaign')
    ),

    productWorkspaces: computed(() => 
      store.workspaces().filter(w => w.type === 'product')
    ),

    internalWorkspaces: computed(() => 
      store.workspaces().filter(w => w.type === 'internal')
    ),

    // Current workspace
    currentWorkspace: computed(() => {
      const id = store.currentWorkspaceId();
      return id ? store.workspaceById()[id] ?? null : null;
    }),

    // Recent workspaces (last 5)
    recentWorkspacesList: computed(() => 
      store.recentWorkspaces()
        .sort((a, b) => b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime())
        .slice(0, 5)
    ),

    // Favorite workspaces (sorted by order)
    favoriteWorkspacesList: computed(() => 
      store.favoriteWorkspaces().sort((a, b) => a.order - b.order)
    ),

    // Statistics
    totalWorkspaces: computed(() => store.workspaces().length),
    ownedWorkspacesCount: computed(() => 
      store.workspaces().filter(w => w.membership?.role === 'Owner').length
    ),
    memberWorkspacesCount: computed(() => 
      store.workspaces().filter(w => 
        w.membership?.role && 
        ['Admin', 'Member', 'Guest'].includes(w.membership.role)
      ).length
    ),

    // Checks
    hasWorkspaces: computed(() => store.workspaces().length > 0),
    hasOwnedWorkspaces: computed(() => 
      store.workspaces().some(w => w.membership?.role === 'Owner')
    ),
    canCreateWorkspace: computed(() => true), // Could check quota here

    // Loading state
    isLoading: computed(() => store.loading()),
  })),
  withMethods((store, workspaceListService = inject(WorkspaceListService)) => {
    /**
     * Load workspaces for current user
     */
    const loadWorkspaces = rxMethod<{ userId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ userId }) => {
          if (!userId) {
            patchState(store, { loading: false, error: 'No authenticated user' });
            return of([]);
          }

          return workspaceListService.getWorkspaces(userId).pipe(
            tap((workspaces: WorkspaceListItem[]) => {
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
            catchError((err: Error) => {
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
        switchMap((workspace: Omit<WorkspaceListItem, 'id'>) =>
          workspaceListService.createWorkspace(workspace).pipe(
            tap((workspaceId: string) => {
              patchState(store, { loading: false });
              // Reload workspaces to get the updated list
              loadWorkspaces();
            }),
            catchError((err: Error) => {
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
        switchMap((workspaceId: string) =>
          workspaceListService.archiveWorkspace(workspaceId).pipe(
            tap(() => {
              patchState(store, { loading: false });
              // Reload workspaces
              loadWorkspaces();
            }),
            catchError((err: Error) => {
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
    const leaveWorkspace = rxMethod<{ workspaceId: string; userId: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ workspaceId, userId }) => {
          if (!userId) {
            patchState(store, { loading: false, error: 'No authenticated user' });
            return of(null);
          }

          return workspaceListService.leaveWorkspace(workspaceId, userId).pipe(
            tap(() => {
              patchState(store, { loading: false, currentWorkspaceId: null });
              // Reload workspaces
              loadWorkspaces({ userId });
            }),
            catchError((err: Error) => {
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
    const toggleFavorite = rxMethod<{ workspaceId: string; userId: string; isFavorite: boolean }>(
      pipe(
        switchMap(({ workspaceId, userId, isFavorite }) => {
          if (!userId) return of(null);

          return workspaceListService.toggleFavorite(workspaceId, userId, isFavorite).pipe(
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
      selectWorkspace(workspaceId: string | null, userId?: string) {
        patchState(store, { currentWorkspaceId: workspaceId });
        
        // Update last accessed time using rxMethod
        if (workspaceId && userId) {
          const updateLastAccessedEffect = rxMethod<{ workspaceId: string; userId: string }>(
            pipe(
              switchMap(({ workspaceId, userId }) => 
                workspaceListService.updateLastAccessed(workspaceId, userId)
              ),
              catchError(() => of(null))
            )
          );
          
          updateLastAccessedEffect({ workspaceId, userId });
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
      const eventBus = inject(EventBusStore);
      
      // Listen for auth.login events to auto-load workspaces
      effect(() => {
        const lastEvent = eventBus.lastEvent();
        if (lastEvent && lastEvent.type === 'auth.login') {
          const userInfo = lastEvent.payload as { userId: string };
          if (userInfo && userInfo.userId) {
            store.loadWorkspaces({ userId: userInfo.userId });
          }
        }
      });
      
      // Listen for auth.logout events to clear workspace list
      effect(() => {
        const lastEvent = eventBus.lastEvent();
        if (lastEvent && lastEvent.type === 'auth.logout') {
          store.clearAll();
        }
      });
    },
  })
);

export type WorkspaceListStoreInstance = InstanceType<typeof WorkspaceListStore>;
