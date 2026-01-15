import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject } from '@angular/core';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { initialAuthState } from './auth.state';
import { AuthService } from '../services/auth.service';

type AuthState = typeof initialAuthState;

/**
 * AuthStore - Zone-less Compatible Signal Store
 * 
 * This store manages authentication state using @ngrx/signals, which is fully compatible
 * with Angular's zone-less change detection mode.
 * 
 * Zone-less Compatibility:
 * - All state is managed through signals (withState, withComputed)
 * - All async operations use rxMethod() which properly integrates with signals
 * - patchState() updates signals, triggering change detection automatically
 * - No Zone.js needed for change detection - signals handle it
 * 
 * Reactive Patterns:
 * 1. User interactions call methods (login, logout, etc.)
 * 2. Methods trigger rxMethod effects
 * 3. Effects update state via patchState (signal modification)
 * 4. Signal updates automatically trigger UI updates in zone-less mode
 * 5. Computed signals derive additional state reactively
 * 
 * Architecture Compliance:
 * - Account: Firebase Auth provides identity (who you are)
 * - AuthStore: Manages authentication state (signal-based)
 * - Workspace: ContextStore reacts to auth changes (Account → Workspace)
 * 
 * Why this works without Zone.js:
 * - rxMethod() subscribes to observables and updates signals
 * - patchState() is the only way to modify state (enforced by @ngrx/signals)
 * - Every patchState() call triggers signal updates
 * - Signal updates trigger change detection in zone-less mode
 * - No manual markForCheck() needed
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialAuthState),
  withComputed(({ status, user }) => ({
    isAuthenticated: computed(() => {
      return status() === 'authenticated' && user() !== null;
    }),
    isLoading: computed(() => status() === 'loading'),
    isUnauthenticated: computed(() => status() === 'unauthenticated'),
  })),
  withMethods((store, authService = inject(AuthService)) => {
    // Reactive login method using rxMethod
    // Zone-less: Observable operations update signals via patchState
    const loginEffect = rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap((credentials) =>
          authService.login(credentials.email, credentials.password).pipe(
            tap((user) => {
              patchState(store, {
                user: user || null,
                status: 'authenticated',
                error: null,
              });
            }),
            catchError((error: any) => {
              patchState(store, {
                user: null,
                status: 'unauthenticated',
                error: error.message || 'Login failed',
              });
              return of(null);
            })
          )
        )
      )
    );

    // Reactive register method using rxMethod
    const registerEffect = rxMethod<{ email: string; password: string }>(
      pipe(
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap((credentials) =>
          authService.register(credentials.email, credentials.password).pipe(
            tap((user) => {
              patchState(store, {
                user: user || null,
                status: 'authenticated',
                error: null,
              });
            }),
            catchError((error: any) => {
              patchState(store, {
                user: null,
                status: 'unauthenticated',
                error: error.message || 'Registration failed',
              });
              return of(null);
            })
          )
        )
      )
    );

    // Reactive reset password method using rxMethod
    const resetPasswordEffect = rxMethod<{ email: string }>(
      pipe(
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap((data) =>
          authService.resetPassword(data.email).pipe(
            tap(() => {
              patchState(store, {
                status: 'idle',
                error: null,
              });
            }),
            catchError((error: any) => {
              patchState(store, {
                error: error.message || 'Password reset failed',
                status: 'idle',
              });
              return of(null);
            })
          )
        )
      )
    );

    // Reactive logout method using rxMethod
    const logoutEffect = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading' })),
        switchMap(() =>
          authService.logout().pipe(
            tap(() => {
              patchState(store, {
                user: null,
                status: 'unauthenticated',
                error: null,
              });
            }),
            catchError((error: any) => {
              patchState(store, {
                user: null,
                status: 'unauthenticated',
                error: error.message || 'Logout failed',
              });
              return of(null);
            })
          )
        )
      )
    );

    return {
      // Expose async methods that call the reactive effects
      async login(credentials: { email: string; password: string }): Promise<void> {
        loginEffect(credentials);
      },
      async register(credentials: { email: string; password: string }): Promise<void> {
        registerEffect(credentials);
      },
      async resetPassword(data: { email: string }): Promise<void> {
        resetPasswordEffect(data);
      },
      async logout(): Promise<void> {
        logoutEffect();
      },
      setUser(user: any) {
        patchState(store, {
          user,
          status: user ? 'authenticated' : 'unauthenticated',
        });
      },
    };
  }),
  withHooks({
    onInit(store, authService = inject(AuthService)) {
      // Reactive method to sync auth state changes
      // Zone-less: This runs continuously, updating signals when Firebase auth state changes
      const syncAuthState = rxMethod<void>(
        pipe(
          switchMap(() => authService.authState$),
          tap((user) => {
            store.setUser(user);
          }),
          catchError((error) => {
            console.error('Auth state sync error:', error);
            return of(null);
          })
        )
      );

      // Start syncing auth state
      // This creates a reactive subscription that updates signals
      // Signal updates trigger change detection in zone-less mode
      syncAuthState();
    },
  })
);
