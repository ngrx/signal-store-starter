/**
 * Workspace Overview Models
 * Module.overview = WorkspaceSummary (Dashboard | Health | Usage | RecentActivity)
 * Per prd-sup.md section on Module.overview
 */

export interface WorkspaceOverview {
  id: string;
  workspaceId: string;
  
  // Dashboard metrics
  dashboard: DashboardMetrics;
  
  // Health status
  health: HealthStatus;
  
  // Usage statistics
  usage: UsageStats;
  
  // Recent activity
  recentActivity: ActivityItem[];
  
  // Metadata
  lastUpdated: Date;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  
  totalDocuments: number;
  totalMembers: number;
  
  recentTasksCount: number;
  recentDocumentsCount: number;
  recentActivityCount: number;
}

export interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  issues: HealthIssue[];
  lastChecked: Date;
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'quota' | 'permission' | 'integration' | 'performance';
  message: string;
  resolvedAt?: Date;
}

export interface UsageStats {
  storageUsed: number; // bytes
  storageQuota: number; // bytes
  apiCalls: number;
  apiCallsQuota: number;
  membersCount: number;
  membersQuota: number;
  period: 'daily' | 'weekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
}

export interface ActivityItem {
  id: string;
  type: 'task_created' | 'task_completed' | 'document_uploaded' | 'member_joined' | 'permission_changed' | 'setting_updated';
  workspaceId: string;
  actorId: string;
  actorName: string;
  targetId?: string;
  targetName?: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
