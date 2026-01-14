import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../auth/stores/auth.store';

/**
 * AppInitializerService
 * 
 * Coordinates the initialization of critical application state before the app starts rendering.
 * This service is called by APP_INITIALIZER to ensure:
 * 1. Firebase Auth is ready
 * 2. AuthStore has initial user state
 * 3. ContextStore can initialize based on auth state
 * 
 * Architecture compliance:
 * - Respects Auth Stack: Firebase Auth → AuthStore → Context
 * - Maintains reactive patterns using rxjs
 * - Ensures Account → Workspace hierarchy is ready
 */
@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  private auth = inject(Auth);
  private authStore = inject(AuthStore);

  /**
   * Initialize the application
   * 
   * This method:
   * 1. Waits for Firebase Auth to emit its initial state
   * 2. Synchronizes the user state to AuthStore
   * 3. Returns a Promise that resolves when initialization is complete
   * 
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    try {
      console.log('[AppInitializer] Starting application initialization...');

      // Wait for Firebase Auth to emit its first value (authenticated or null)
      // This ensures we know the auth state before the app renders
      const user = await firstValueFrom(authState(this.auth));

      console.log('[AppInitializer] Firebase Auth state received:', user ? 'Authenticated' : 'Unauthenticated');

      // Synchronize user state to AuthStore
      // This triggers the store's state update and computed signals
      this.authStore.setUser(user);

      // ContextStore will initialize via its withHooks.onInit when AuthStore state changes
      // No need to manually trigger it here - it's reactive to auth state

      console.log('[AppInitializer] Application initialization complete');
    } catch (error) {
      console.error('[AppInitializer] Initialization failed:', error);
      // Set unauthenticated state on error
      this.authStore.setUser(null);
      // Don't throw - allow app to start even if auth check fails
      // The app will redirect to login via auth guards
    }
  }
}
