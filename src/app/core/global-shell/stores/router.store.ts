/**
 * RouterStore - NgRx Signals store for router state
 * GlobalShell.Router = RouterSignals (currentRoute | routeParams | queryParams)
 * Per prd-sup.md section on GlobalShell.Router
 */

import { computed, inject } from '@angular/core';
import { Router, NavigationEnd, NavigationStart, NavigationCancel, NavigationError } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, filter, tap } from 'rxjs';
import { initialRouterState } from '../state/router.state';
import { RouteInfo, NavigationEvent } from '../models/router.model';

export const RouterStore = signalStore(
  { providedIn: 'root' },
  withState(initialRouterState),
  withComputed(({ currentRoute, previousRoute, navigationHistory, isNavigating }) => ({
    // Current route info
    currentPath: computed(() => currentRoute()?.path ?? ''),
    currentUrl: computed(() => currentRoute()?.url ?? ''),
    routeParams: computed(() => currentRoute()?.params ?? {}),
    queryParams: computed(() => currentRoute()?.queryParams ?? {}),
    routeFragment: computed(() => currentRoute()?.fragment ?? null),
    routeData: computed(() => currentRoute()?.data ?? {}),
    routeTitle: computed(() => currentRoute()?.title ?? null),
    
    // Previous route
    previousPath: computed(() => previousRoute()?.path ?? ''),
    canGoBack: computed(() => navigationHistory().length > 1),
    
    // Navigation state
    isNavigating: computed(() => isNavigating()),
    
    // History
    historyLength: computed(() => navigationHistory().length),
  })),
  withMethods((store, router = inject(Router)) => {
    /**
     * Track router events
     */
    const trackNavigation = rxMethod<void>(
      pipe(
        tap(() => {
          router.events.pipe(
            filter(event => 
              event instanceof NavigationStart ||
              event instanceof NavigationEnd ||
              event instanceof NavigationCancel ||
              event instanceof NavigationError
            )
          ).subscribe(event => {
            if (event instanceof NavigationStart) {
              patchState(store, { isNavigating: true });
            } else if (event instanceof NavigationEnd) {
              const route: RouteInfo = {
                path: router.url.split('?')[0],
                url: router.url,
                params: {}, // Would need ActivatedRoute to get actual params
                queryParams: {}, // Parse from URL
                fragment: null,
                data: {},
              };
              
              const previous = store.currentRoute();
              const history = [...store.navigationHistory(), route].slice(-50); // Keep last 50
              
              patchState(store, {
                currentRoute: route,
                previousRoute: previous,
                navigationHistory: history,
                isNavigating: false,
              });
            } else {
              patchState(store, { isNavigating: false });
            }
          });
        })
      )
    );

    return {
      // Reactive effects
      trackNavigation,

      // Navigation methods
      async navigate(path: string | string[], extras?: any): Promise<boolean> {
        const pathArray = Array.isArray(path) ? path : [path];
        return router.navigate(pathArray, extras);
      },

      async navigateByUrl(url: string): Promise<boolean> {
        return router.navigateByUrl(url);
      },

      async back(): Promise<void> {
        const history = store.navigationHistory();
        if (history.length > 1) {
          const previous = history[history.length - 2];
          await this.navigateByUrl(previous.url);
        }
      },

      // State updates
      setCurrentRoute(route: RouteInfo) {
        const previous = store.currentRoute();
        const history = [...store.navigationHistory(), route].slice(-50);
        
        patchState(store, {
          currentRoute: route,
          previousRoute: previous,
          navigationHistory: history,
        });
      },

      clearHistory() {
        patchState(store, {
          navigationHistory: store.currentRoute() ? [store.currentRoute()!] : [],
        });
      },

      resetRouter() {
        patchState(store, initialRouterState);
      },
    };
  }),
  withHooks({
    onInit(store) {
      // Start tracking navigation
      store.trackNavigation();
    },
  })
);
