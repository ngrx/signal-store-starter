import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
  withHooks,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { initialAuthState } from './auth.state';
import { AuthService } from '../services/auth.service';

type AuthState = typeof initialAuthState;

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
  withMethods((store, authService = inject(AuthService)) => ({
    async login(credentials: { email: string; password: string }): Promise<void> {
      patchState(store, { status: 'loading', error: null });
      try {
        const user = await authService.login(credentials.email, credentials.password).toPromise();
        patchState(store, {
          user: user || null,
          status: 'authenticated',
          error: null,
        });
      } catch (error: any) {
        patchState(store, {
          status: 'unauthenticated',
          error: error.message || 'Login failed',
        });
      }
    },
    async register(credentials: { email: string; password: string }): Promise<void> {
      patchState(store, { status: 'loading', error: null });
      try {
        const user = await authService.register(credentials.email, credentials.password).toPromise();
        patchState(store, {
          user: user || null,
          status: 'authenticated',
          error: null,
        });
      } catch (error: any) {
        patchState(store, {
          status: 'unauthenticated',
          error: error.message || 'Registration failed',
        });
      }
    },
    async resetPassword(data: { email: string }): Promise<void> {
      patchState(store, { status: 'loading', error: null });
      try {
        await authService.resetPassword(data.email).toPromise();
        patchState(store, {
          status: 'idle',
          error: null,
        });
      } catch (error: any) {
        patchState(store, {
          error: error.message || 'Password reset failed',
          status: 'idle',
        });
      }
    },
    async logout(): Promise<void> {
      patchState(store, { status: 'loading' });
      try {
        await authService.logout().toPromise();
        patchState(store, {
          user: null,
          status: 'unauthenticated',
          error: null,
        });
      } catch (error: any) {
        patchState(store, {
          error: error.message || 'Logout failed',
        });
      }
    },
    setUser(user: any) {
      patchState(store, {
        user,
        status: user ? 'authenticated' : 'unauthenticated',
      });
    },
  })),
  withHooks({
    onInit(store, authService = inject(AuthService)) {
      authService.authState$.subscribe((user) => {
        store.setUser(user);
      });
    },
  })
);

