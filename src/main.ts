import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

/**
 * Zone-less Bootstrap Configuration
 * 
 * This application uses Angular's zone-less change detection mode (stable in Angular 20+).
 * 
 * What this means:
 * - Zone.js is NOT included in the bundle (saves ~40KB)
 * - Change detection is signal-based, not zone-based
 * - Better performance through explicit reactivity
 * - No automatic change detection after async operations
 * 
 * How it works:
 * 1. provideZonelessChangeDetection() in appConfig enables zone-less mode (stable API)
 * 2. All state is managed through @ngrx/signals (AuthStore, ContextStore, etc.)
 * 3. Signal updates automatically trigger change detection
 * 4. No Zone.js means no NG0908 error
 * 
 * Bootstrap sequence:
 * 1. bootstrapApplication() starts with zone-less providers
 * 2. AuthStore.withHooks.onInit wires authState$ to signals
 * 3. Firebase Auth state is loaded reactively
 * 4. AuthStore.setUser() updates signals
 * 5. Signal updates trigger change detection
 * 6. ContextStore reacts to auth changes via withHooks.onInit
 * 7. App renders with fully initialized reactive state
 * 
 * Architecture compliance:
 * - Account (Firebase Auth) → Identity verification
 * - Workspace (ContextStore) → Logical boundary
 * - Module (Feature stores) → Functional units
 * - Entity (Signal state) → Data models
 * 
 * All reactive patterns are zone-less compatible:
 * - rxMethod() in stores handles async operations
 * - patchState() updates signals
 * - computed() derives state
 * - withHooks.onInit() initializes reactive subscriptions
 */
bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    console.log('[Bootstrap] Zone-less application started successfully (Angular 20+)');
    console.log('[Bootstrap] Change detection: Signal-based (Zone.js not loaded)');
  })
  .catch((err) => {
    console.error('[Bootstrap] Application failed to start:', err);
    // Display error message to user
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        font-family: system-ui, -apple-system, sans-serif;
        color: #dc2626;
        background-color: #fef2f2;
        padding: 20px;
      ">
        <h1 style="font-size: 24px; margin-bottom: 12px;">Application Failed to Start</h1>
        <p style="margin-bottom: 8px;">Please try refreshing the page.</p>
        <p style="font-size: 14px; color: #991b1b; max-width: 600px; text-align: center;">
          If this problem persists, please contact support.
        </p>
        <details style="margin-top: 20px; max-width: 800px;">
          <summary style="cursor: pointer; color: #991b1b;">Technical Details</summary>
          <pre style="
            margin-top: 12px;
            padding: 12px;
            background-color: #fff;
            border: 1px solid #fecaca;
            border-radius: 4px;
            overflow: auto;
            font-size: 12px;
          ">${err.message || err}</pre>
        </details>
      </div>
    `;
  });
