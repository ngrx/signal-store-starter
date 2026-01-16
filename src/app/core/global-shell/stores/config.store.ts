/**
 * ConfigStore - NgRx Signals store for global configuration
 * GlobalShell.Config = ConfigSignals (appConfig | featureFlags | remoteConfig)
 * Per prd-sup.md section on GlobalShell.Config
 */

import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, of, catchError } from 'rxjs';
import { initialConfigState } from '../state/config.state';
import { AppConfig, RemoteConfig, FeatureFlags } from '../models/config.model';

export const ConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialConfigState),
  withComputed(({ appConfig, remoteConfig, loading }) => ({
    // Feature flags from app config
    featureFlags: computed(() => appConfig()?.features ?? null),
    
    // Individual feature checks
    isAuditEnabled: computed(() => appConfig()?.features.enableAudit ?? false),
    isDocumentsEnabled: computed(() => appConfig()?.features.enableDocuments ?? false),
    isJournalEnabled: computed(() => appConfig()?.features.enableJournal ?? false),
    isTasksEnabled: computed(() => appConfig()?.features.enableTasks ?? false),
    isTeamsEnabled: computed(() => appConfig()?.features.enableTeams ?? false),
    isPartnersEnabled: computed(() => appConfig()?.features.enablePartners ?? false),
    isOrganizationsEnabled: computed(() => appConfig()?.features.enableOrganizations ?? false),
    
    // Remote config checks
    isMaintenanceMode: computed(() => remoteConfig()?.maintenanceMode ?? false),
    maxWorkspaces: computed(() => remoteConfig()?.maxWorkspaces ?? 10),
    maxMembersPerWorkspace: computed(() => remoteConfig()?.maxMembersPerWorkspace ?? 50),
    
    // Loading state
    isLoading: computed(() => loading()),
    
    // Environment info
    environment: computed(() => appConfig()?.environment ?? 'development'),
    appVersion: computed(() => appConfig()?.appVersion ?? '0.0.0'),
  })),
  withMethods((store) => {
    /**
     * Load remote config
     * In real implementation, this would fetch from Firebase Remote Config
     */
    const loadRemoteConfig = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        tap(() => {
          // Mock implementation - replace with actual Firebase Remote Config
          patchState(store, {
            loading: false,
            lastUpdated: new Date(),
          });
        }),
        catchError((err) => {
          patchState(store, {
            error: err.message || 'Failed to load remote config',
            loading: false,
          });
          return of(null);
        })
      )
    );

    return {
      // Reactive effects
      loadRemoteConfig,

      // Synchronous state updates
      setAppConfig(config: AppConfig) {
        patchState(store, {
          appConfig: config,
          lastUpdated: new Date(),
        });
      },

      setRemoteConfig(config: RemoteConfig) {
        patchState(store, {
          remoteConfig: config,
          lastUpdated: new Date(),
        });
      },

      updateFeatureFlags(flags: Partial<FeatureFlags>) {
        const current = store.appConfig();
        if (!current) return;
        
        patchState(store, {
          appConfig: {
            ...current,
            features: {
              ...current.features,
              ...flags,
            },
          },
        });
      },

      clearConfig() {
        patchState(store, initialConfigState);
      },
    };
  })
);
