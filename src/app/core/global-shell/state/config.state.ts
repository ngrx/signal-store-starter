/**
 * Global Configuration State
 * Per prd-sup.md section on GlobalShell.Config
 */

import { AppConfig, FeatureFlags, RemoteConfig } from '../models/config.model';

export interface ConfigState {
  appConfig: AppConfig | null;
  remoteConfig: RemoteConfig | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const defaultFeatureFlags: FeatureFlags = {
  enableAudit: true,
  enableDocuments: true,
  enableJournal: true,
  enableTasks: true,
  enableTeams: true,
  enablePartners: true,
  enableOrganizations: true,
  enableAnalytics: false,
  enableNotifications: true,
  enableRealtime: true,
  enableOffline: false,
};

export const defaultRemoteConfig: RemoteConfig = {
  maintenanceMode: false,
  minAppVersion: '0.0.0',
  forceUpdate: false,
  maxUploadSize: 10 * 1024 * 1024, // 10MB
  maxWorkspaces: 10,
  maxMembersPerWorkspace: 50,
  rateLimits: {
    apiCallsPerMinute: 60,
    apiCallsPerHour: 1000,
    maxConcurrentRequests: 10,
  },
};

export const initialConfigState: ConfigState = {
  appConfig: null,
  remoteConfig: defaultRemoteConfig,
  loading: false,
  error: null,
  lastUpdated: null,
};
