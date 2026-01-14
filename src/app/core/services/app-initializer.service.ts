import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../auth/stores/auth.store';

/**
 * AppInitializerService
 * 
 * Coordinates the initialization of critical application state before the app starts rendering.
 * 
 * Zone-less Mode Compatibility:
 * This service is fully compatible with zone-less change detection because:
 * 1. It returns a Promise from initialize() - APP_INITIALIZER compatible
 * 2. Uses firstValueFrom() to convert Observable to Promise
 * 3. Updates AuthStore via setUser() which modifies signals
 * 4. Signal updates automatically trigger change detection (no Zone.js needed)
 * 
 * Initialization ensures:
 * 1. Firebase Auth is ready
 * 2. AuthStore has initial user state
 * 3. ContextStore can initialize based on auth state
 * 
 * Architecture compliance:
 * - Respects Auth Stack: Firebase Auth → AuthStore → Context
 * - Maintains reactive patterns using RxJS → Signals
 * - Ensures Account → Workspace hierarchy is ready
 * - All state updates go through signals for zone-less compatibility
 * 
 * Reactive Flow:
 * Firebase Auth (Observable)
 *   → firstValueFrom() (Promise)
 *   → AuthStore.setUser() (Signal update via patchState)
 *   → Change detection triggered (zone-less signal-based)
 *   → AuthStore.withHooks.onInit() starts continuous sync
 *   → ContextStore reacts to auth state changes
 */
@Injectable({
  providedIn: 'root',
})
export class AppInitializerService {
  private auth = inject(Auth);
  private authStore = inject(AuthStore);

  /**
   * Initialize the application (Zone-less compatible)
   * 
   * This method:
   * 1. Waits for Firebase Auth to emit its initial state
   * 2. Synchronizes the user state to AuthStore via signal update
   * 3. Returns a Promise that resolves when initialization is complete
   * 
   * Zone-less change detection:
   * - The Promise completion allows bootstrap to continue
   * - AuthStore.setUser() calls patchState() which updates signals
   * - Signal updates trigger change detection without Zone.js
   * - Subsequent auth state changes are handled by AuthStore.withHooks.onInit
   * 
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    try {
      console.log('[AppInitializer] Starting zone-less application initialization...');

      // Wait for Firebase Auth to emit its first value (authenticated or null)
      // This ensures we know the auth state before the app renders
      // firstValueFrom converts Observable to Promise for APP_INITIALIZER
      const user = await firstValueFrom(authState(this.auth));

      console.log('[AppInitializer] Firebase Auth state received:', user ? 'Authenticated' : 'Unauthenticated');

      // Synchronize user state to AuthStore
      // This triggers the store's state update via patchState (signal modification)
      // Signal updates automatically trigger change detection in zone-less mode
      this.authStore.setUser(user);

      // ContextStore will initialize via its withHooks.onInit when AuthStore state changes
      // No need to manually trigger it here - it's reactive to auth state
      // The reactive chain is: Signal update → Computed signals → UI update

      console.log('[AppInitializer] Zone-less application initialization complete');
      console.log('[AppInitializer] All state managed through @ngrx/signals');
    } catch (error) {
      console.error('[AppInitializer] Initialization failed:', error);
      // Set unauthenticated state on error
      // Signal update even on error ensures consistent state
      this.authStore.setUser(null);
      // Don't throw - allow app to start even if auth check fails
      // The app will redirect to login via auth guards
    }
  }
}
