import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed, inject, Type } from '@angular/core';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { initialAuthState } from '../state/auth.state';
import { AuthService } from '../services/auth.service';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../workspace/stores/workspace.store';
import { AccountService } from '../../account/services/account.service';

type AuthState = typeof initialAuthState;

export interface AuthStoreInstance {
  user: () => any;
  status: () => AuthState['status'];
  error: () => string | null;
  initialized: () => boolean;
  isInitializing: () => boolean;
  isAuthenticated: () => boolean;
  isLoading: () => boolean;
  isUnauthenticated: () => boolean;
  login(credentials: { email: string; password: string }): Promise<void>;
  register(credentials: { email: string; password: string }): Promise<void>;
  resetPassword(data: { email: string }): Promise<void>;
  logout(): Promise<void>;
  verifyEmail(): Promise<void>;
  setUser(user: any): void;
}

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
 * - Workspace: WorkspaceStore reacts to auth changes (Account → Workspace)
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
  withComputed(({ status, user, initialized }) => ({
    isInitializing: computed(() => status() === 'initializing'),
    isAuthenticated: computed(() => {
      // Only return true if initialized AND authenticated with user
      return initialized() && status() === 'authenticated' && user() !== null;
    }),
    isLoading: computed(() => status() === 'loading'),
    isUnauthenticated: computed(() => {
      // Only return true if initialized AND confirmed unauthenticated
      return initialized() && status() === 'unauthenticated';
    }),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      workspaceStore = inject<WorkspaceStoreInstance>(WorkspaceStore),
      accountService = inject(AccountService)
    ) => {
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
                initialized: true, // Mark as initialized after successful login
              });
            }),
            catchError((error: any) => {
              patchState(store, {
                user: null,
                status: 'unauthenticated',
                error: error.message || 'Login failed',
                initialized: true, // Mark as initialized even on error
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
                initialized: true,
              });
            }),
            catchError((error: any) => {
              patchState(store, {
                user: null,
                status: 'unauthenticated',
                error: error.message || 'Registration failed',
                initialized: true,
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
                initialized: true, // Keep initialized = true (we know the state)
              });
              workspaceStore.clearAll();
            }),
            catchError((error: any) => {
              patchState(store, {
                user: null,
                status: 'unauthenticated',
                error: error.message || 'Logout failed',
                initialized: true,
              });
              return of(null);
            })
          )
        )
      )
    );

    const verifyEmailEffect = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { status: 'loading', error: null })),
        switchMap(() =>
          authService.sendVerificationEmail().pipe(
            tap(() => {
              patchState(store, { status: 'idle' });
            }),
            catchError((error: any) => {
              patchState(store, {
                error: error.message || 'Verification email failed',
                status: 'idle',
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
      async verifyEmail(): Promise<void> {
        verifyEmailEffect();
      },
      setUser(user: any) {
        patchState(store, {
          user,
          status: user ? 'authenticated' : 'unauthenticated',
          initialized: true, // Auth state has been determined
        });
      },
    };
  }),
  withHooks({
    onInit(store, authService = inject(AuthService), accountService = inject(AccountService)) {
      // Reactive method to sync auth state changes
      // Zone-less: This runs continuously, updating signals when Firebase auth state changes
      const syncAuthState = rxMethod<void>(
        pipe(
          switchMap(() => authService.authState$),
          switchMap((user) => {
            store.setUser(user);

            if (!user) {
              return of(null);
            }

            return accountService.ensureUserAccount({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              emailVerified: user.emailVerified,
            });
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
) as unknown as Type<AuthStoreInstance>;
