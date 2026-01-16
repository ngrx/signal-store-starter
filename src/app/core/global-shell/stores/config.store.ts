/**
 * ConfigStore - NgRx Signals store for global configuration
 * GlobalShell.Config = ConfigSignals (appConfig | featureFlags | remoteConfig)
 * Per prd-sup.md section on GlobalShell.Config
 */

import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, of, catchError, from, switchMap } from 'rxjs';
import { RemoteConfig, getValue, fetchAndActivate } from '@angular/fire/remote-config';
import { initialConfigState } from '../state/config.state';
import { AppConfig, RemoteConfig as RemoteConfigModel, FeatureFlags } from '../models/config.model';

export const ConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialConfigState),
  withComputed((store) => ({
    // Feature flags from app config
    featureFlags: computed(() => store.appConfig()?.features ?? null),
    
    // Individual feature checks
    isAuditEnabled: computed(() => store.appConfig()?.features.enableAudit ?? false),
    isDocumentsEnabled: computed(() => store.appConfig()?.features.enableDocuments ?? false),
    isJournalEnabled: computed(() => store.appConfig()?.features.enableJournal ?? false),
    isTasksEnabled: computed(() => store.appConfig()?.features.enableTasks ?? false),
    isTeamsEnabled: computed(() => store.appConfig()?.features.enableTeams ?? false),
    isPartnersEnabled: computed(() => store.appConfig()?.features.enablePartners ?? false),
    isOrganizationsEnabled: computed(() => store.appConfig()?.features.enableOrganizations ?? false),
    
    // Remote config checks
    isMaintenanceMode: computed(() => store.remoteConfig()?.maintenanceMode ?? false),
    maxWorkspaces: computed(() => store.remoteConfig()?.maxWorkspaces ?? 10),
    maxMembersPerWorkspace: computed(() => store.remoteConfig()?.maxMembersPerWorkspace ?? 50),
    
    // Loading state
    isLoading: computed(() => store.loading()),
    
    // Environment info
    environment: computed(() => store.appConfig()?.environment ?? 'development'),
    appVersion: computed(() => store.appConfig()?.appVersion ?? '0.0.0'),
  })),
  withMethods((store) => {
    const remoteConfig = inject(RemoteConfig);

    /**
     * Load remote config from Firebase Remote Config
     */
    const loadRemoteConfig = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => from(fetchAndActivate(remoteConfig))),
        tap(() => {
          // Fetch remote config values
          const maintenanceMode = getValue(remoteConfig, 'maintenanceMode').asBoolean();
          const maxWorkspaces = getValue(remoteConfig, 'maxWorkspaces').asNumber();
          const maxMembersPerWorkspace = getValue(remoteConfig, 'maxMembersPerWorkspace').asNumber();
          
          const config: RemoteConfigModel = {
            maintenanceMode,
            maxWorkspaces: maxWorkspaces || 10,
            maxMembersPerWorkspace: maxMembersPerWorkspace || 50,
          };
          
          patchState(store, {
            remoteConfig: config,
            loading: false,
            lastUpdated: new Date(),
          });
        }),
        catchError((err: Error) => {
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

      setRemoteConfig(config: RemoteConfigModel) {
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
