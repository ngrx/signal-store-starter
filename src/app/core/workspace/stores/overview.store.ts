/**
 * OverviewStore - NgRx Signals store for workspace overview
 * Module.overview = WorkspaceSummary (Dashboard | Health | Usage | RecentActivity)
 * Following pure reactive patterns per prd-sup.md
 */

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { initialOverviewState } from '../state/overview.state';
import { WorkspaceOverview, ActivityItem, DashboardMetrics } from '../models/overview.model';
import { OverviewService } from '../services/overview.service';

export const OverviewStore = signalStore(
  { providedIn: 'root' },
  withState(initialOverviewState),
  withComputed(({ byWorkspace, currentWorkspaceId, loading }) => ({
    // Current workspace overview
    currentOverview: computed(() => {
      const id = currentWorkspaceId();
      if (!id) return null;
      return byWorkspace()[id] ?? null;
    }),

    // Dashboard metrics for current workspace
    dashboardMetrics: computed(() => {
      const overview = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : null;
      })();
      return overview?.dashboard ?? null;
    }),

    // Health status for current workspace
    healthStatus: computed(() => {
      const overview = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : null;
      })();
      return overview?.health ?? null;
    }),

    // Usage stats for current workspace
    usageStats: computed(() => {
      const overview = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : null;
      })();
      return overview?.usage ?? null;
    }),

    // Recent activity for current workspace
    recentActivity: computed(() => {
      const overview = computed(() => {
        const id = currentWorkspaceId();
        return id ? byWorkspace()[id] : null;
      })();
      return overview?.recentActivity ?? [];
    }),

    // Storage usage percentage
    storageUsagePercent: computed(() => {
      const usage = computed(() => {
        const overview = computed(() => {
          const id = currentWorkspaceId();
          return id ? byWorkspace()[id] : null;
        })();
        return overview?.usage;
      })();
      if (!usage) return 0;
      return (usage.storageUsed / usage.storageQuota) * 100;
    }),

    // API calls usage percentage
    apiCallsUsagePercent: computed(() => {
      const usage = computed(() => {
        const overview = computed(() => {
          const id = currentWorkspaceId();
          return id ? byWorkspace()[id] : null;
        })();
        return overview?.usage;
      })();
      if (!usage) return 0;
      return (usage.apiCalls / usage.apiCallsQuota) * 100;
    }),

    // Members usage percentage
    membersUsagePercent: computed(() => {
      const usage = computed(() => {
        const overview = computed(() => {
          const id = currentWorkspaceId();
          return id ? byWorkspace()[id] : null;
        })();
        return overview?.usage;
      })();
      if (!usage) return 0;
      return (usage.membersCount / usage.membersQuota) * 100;
    }),

    // Loading state
    isLoading: computed(() => loading()),

    // Has critical health issues
    hasCriticalIssues: computed(() => {
      const health = computed(() => {
        const overview = computed(() => {
          const id = currentWorkspaceId();
          return id ? byWorkspace()[id] : null;
        })();
        return overview?.health;
      })();
      return health?.overall === 'critical';
    }),
  })),
  withMethods((store, overviewService = inject(OverviewService)) => {
    /**
     * Load overview data using rxMethod
     */
    const loadOverview = rxMethod<string>(
      pipe(
        tap((workspaceId) =>
          patchState(store, {
            currentWorkspaceId: workspaceId,
            loading: true,
            error: null,
          })
        ),
        switchMap((workspaceId) =>
          overviewService.getOverview(workspaceId).pipe(
            tap((overview) => {
              const next = { ...store.byWorkspace(), [workspaceId]: overview };
              patchState(store, {
                byWorkspace: next,
                loading: false,
              });
            }),
            catchError((err) => {
              patchState(store, {
                error: err.message || 'Failed to load overview',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    /**
     * Refresh overview data
     */
    const refreshOverview = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((workspaceId) =>
          overviewService.refreshOverview(workspaceId).pipe(
            tap((overview) => {
              const next = { ...store.byWorkspace(), [workspaceId]: overview };
              patchState(store, {
                byWorkspace: next,
                loading: false,
              });
            }),
            catchError((err) => {
              patchState(store, {
                error: err.message || 'Failed to refresh overview',
                loading: false,
              });
              return of(null);
            })
          )
        )
      )
    );

    return {
      // Reactive effects
      loadOverview,
      refreshOverview,

      // Synchronous state updates
      setOverview(workspaceId: string, overview: WorkspaceOverview) {
        const next = { ...store.byWorkspace(), [workspaceId]: overview };
        patchState(store, {
          byWorkspace: next,
          currentWorkspaceId: workspaceId,
        });
      },

      setCurrentWorkspace(workspaceId: string) {
        patchState(store, { currentWorkspaceId: workspaceId });
      },

      clearOverview(workspaceId: string) {
        const next = { ...store.byWorkspace() };
        delete next[workspaceId];
        patchState(store, { byWorkspace: next });
      },

      clearAll() {
        patchState(store, initialOverviewState);
      },
    };
  })
);
