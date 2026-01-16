/**
 * Global Configuration Models
 * GlobalShell.Config = ConfigSignals (appConfig | featureFlags | remoteConfig)
 * Per prd-sup.md section on GlobalShell
 */

export interface AppConfig {
  appName: string;
  appVersion: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  firebaseConfig: FirebaseConfig;
  features: FeatureFlags;
}

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId?: string;
}

export interface FeatureFlags {
  enableAudit: boolean;
  enableDocuments: boolean;
  enableJournal: boolean;
  enableTasks: boolean;
  enableTeams: boolean;
  enablePartners: boolean;
  enableOrganizations: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableRealtime: boolean;
  enableOffline: boolean;
}

export interface RemoteConfig {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  minAppVersion: string;
  forceUpdate: boolean;
  maxUploadSize: number; // bytes
  maxWorkspaces: number;
  maxMembersPerWorkspace: number;
  rateLimits: RateLimits;
}

export interface RateLimits {
  apiCallsPerMinute: number;
  apiCallsPerHour: number;
  maxConcurrentRequests: number;
}
