import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore, AuthStoreInstance } from '../stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject<AuthStoreInstance>(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
