import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore, AuthStoreInstance } from '../stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject<AuthStoreInstance>(AuthStore);
  const router = inject(Router);

  // Critical: Do NOT redirect during initialization
  // Wait for auth state to be determined before making routing decisions
  if (authStore.isInitializing()) {
    // Still initializing - allow navigation to continue
    // The auth state sync will handle redirects after initialization
    return true;
  }

  // Auth state has been determined - now we can make routing decisions
  if (authStore.isAuthenticated()) {
    return true;
  }

  // Confirmed unauthenticated - redirect to login
  return router.createUrlTree(['/login']);
};
