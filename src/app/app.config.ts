import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  provideAppCheck,
} from '@angular/fire/app-check';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getDataConnect, provideDataConnect } from '@angular/fire/data-connect';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { getRemoteConfig, provideRemoteConfig } from '@angular/fire/remote-config';
import { getVertexAI, provideVertexAI } from '@angular/fire/vertexai';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

/**
 * Application Configuration with Zone-less Change Detection
 * 
 * This configuration enables Angular's zone-less mode (stable in Angular 20+), which provides:
 * 
 * Benefits:
 * - Improved performance: No Zone.js overhead for change detection
 * - Smaller bundle size: Zone.js (~40KB) is not included
 * - Better debugging: Explicit change detection through signals
 * - Modern architecture: Fully reactive with @ngrx/signals
 * 
 * Architecture Compliance:
 * - Zone-less mode requires all state updates to go through signals
 * - @ngrx/signals provides the reactive foundation
 * - @angular/fire observables are consumed and converted to signals
 * 
 * How it works:
 * 1. provideZonelessChangeDetection() removes Zone.js dependency (stable API in Angular 20+)
 * 2. Change detection is triggered by:
 *    - Signal updates (via patchState in stores)
 *    - User interactions (click, input, etc.)
 *    - Manual markForCheck() when needed
 * 3. All Firebase operations update signals via rxMethod patterns
 * 4. The reactive chain: Firebase → Observable → Signal → UI
 * 
 * Domain Architecture:
 * - Account (Identity via Firebase Auth)
 *   → Workspace (Logical boundary via AuthStore/ContextStore)
 *   → Module (Features via signal stores)
 *   → Entity (State via @ngrx/signals)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Zone-less change detection MUST be the first provider
    // This tells Angular to use signal-based change detection instead of Zone.js
    // Note: This is now a stable API in Angular 20+ (no longer experimental)
    provideZonelessChangeDetection(),

    // Router configuration
    provideRouter(routes),

    // Firebase App Initialization
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    
    // Firebase Services
    // All Firebase services work in zone-less mode because:
    // - Their observables are consumed by @ngrx/signals stores
    // - State updates trigger change detection via signal modifications
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()),
    ScreenTrackingService,
    UserTrackingService,
    
    // Firebase App Check with reCAPTCHA Enterprise (disabled in non-production to avoid local 403s)
    ...(
      environment.production && environment.appCheckSiteKey
        ? [
            provideAppCheck(() => {
              const provider = new ReCaptchaEnterpriseProvider(environment.appCheckSiteKey);
              return initializeAppCheck(undefined, { provider, isTokenAutoRefreshEnabled: true });
            }),
          ]
        : []
    ),
    provideDatabase(() => getDatabase()),
    provideDataConnect(() =>
      getDataConnect({
        connector: environment.dataConnect.connector,
        location: environment.dataConnect.location,
        service: environment.dataConnect.service,
      })
    ),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    providePerformance(() => getPerformance()),
    provideStorage(() => getStorage()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideVertexAI(() => getVertexAI()),

    /**
     * NOTE: APP_INITIALIZER is deprecated in Angular 20.
     * Reactive bootstrap is handled directly inside the signal stores:
     * - AuthStore.withHooks.onInit() subscribes to authState$ and updates signals
     * - ContextStore reacts to AuthStore signal changes to build the workspace context
     * This keeps the app fully zone-less without legacy initializer tokens.
     */
  ],
};
