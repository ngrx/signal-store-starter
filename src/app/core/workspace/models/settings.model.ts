// Settings model definitions for workspace configuration
export interface WorkspaceSettings {
  id: string;
  workspaceId: string;
  general: GeneralSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  integrations: IntegrationSettings;
}

export interface GeneralSettings {
  name: string;
  description?: string;
  timezone: string;
  language: string;
  dateFormat: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  slack?: boolean;
  digest: 'daily' | 'weekly' | 'never';
}

export interface SecuritySettings {
  twoFactorRequired: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  allowedDomains: string[];
}

export interface IntegrationSettings {
  github?: boolean;
  jira?: boolean;
  slack?: boolean;
  [key: string]: boolean | undefined;
}
