/**
 * State definitions for workspace overview module
 * Following NgRx Signals patterns per prd-sup.md
 */

import { WorkspaceOverview, ActivityItem, DashboardMetrics, HealthStatus, UsageStats } from '../models/overview.model';

export interface OverviewState {
  // Overview data by workspace
  byWorkspace: Record<string, WorkspaceOverview>;
  
  // Current workspace being viewed
  currentWorkspaceId: string | null;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

export const initialOverviewState: OverviewState = {
  byWorkspace: {},
  currentWorkspaceId: null,
  loading: false,
  error: null,
};

// Default empty overview for initialization
export const createEmptyOverview = (workspaceId: string): WorkspaceOverview => ({
  id: `overview-${workspaceId}`,
  workspaceId,
  dashboard: {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    blockedTasks: 0,
    totalDocuments: 0,
    totalMembers: 0,
    recentTasksCount: 0,
    recentDocumentsCount: 0,
    recentActivityCount: 0,
  },
  health: {
    overall: 'healthy',
    issues: [],
    lastChecked: new Date(),
  },
  usage: {
    storageUsed: 0,
    storageQuota: 1024 * 1024 * 1024, // 1GB default
    apiCalls: 0,
    apiCallsQuota: 10000,
    membersCount: 0,
    membersQuota: 10,
    period: 'monthly',
    periodStart: new Date(),
    periodEnd: new Date(),
  },
  recentActivity: [],
  lastUpdated: new Date(),
});
