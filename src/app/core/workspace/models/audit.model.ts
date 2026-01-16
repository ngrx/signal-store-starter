/**
 * Audit domain models
 * Per prd-sup.md: Module.audit = Traceability (AuditLog | Compliance | History | Export | Retention)
 */

export type AuditLogLevel = 'info' | 'warning' | 'error' | 'critical';
export type AuditCategory = 'access' | 'change' | 'security' | 'compliance' | 'system';
export type AuditAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'login' | 'logout' | 'invite' | 'remove'
  | 'grant' | 'revoke' | 'modify' | 'archive';

/**
 * Audit log entry
 */
export interface AuditLog {
  // Identity
  id: string;
  workspaceId: string;

  // Event classification
  category: AuditCategory;
  action: AuditAction;
  level: AuditLogLevel;
  
  // Subject (who performed the action)
  actorId: string;
  actorType: 'user' | 'system' | 'api';
  actorName: string;
  actorEmail?: string;

  // Target (what was affected)
  resourceType: string;  // 'document', 'task', 'member', etc.
  resourceId?: string;
  resourceName?: string;

  // Details
  description: string;
  changes?: AuditChange[];
  metadata?: Record<string, any>;

  // Context
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  sessionId?: string;

  // Timing
  timestamp: Date;
  duration?: number;  // milliseconds

  // Compliance
  retentionPolicy?: string;
  expiresAt?: Date;
  isImmutable: boolean;
}

/**
 * Audit change detail (before/after for tracking modifications)
 */
export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

/**
 * Audit trail (chronological sequence of logs)
 */
export interface AuditTrail {
  resourceType: string;
  resourceId: string;
  logs: AuditLog[];
  totalCount: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  id: string;
  workspaceId: string;
  reportType: 'access' | 'change' | 'security' | 'full';
  period: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  
  // Statistics
  totalLogs: number;
  logsByCategory: Record<AuditCategory, number>;
  logsByLevel: Record<AuditLogLevel, number>;
  uniqueActors: number;
  
  // Findings
  criticalEvents: AuditLog[];
  securityAlerts: AuditLog[];
  complianceViolations: AuditLog[];
  
  // Export
  exportFormat?: 'pdf' | 'csv' | 'json';
  exportUrl?: string;
}

/**
 * Audit filter criteria
 */
export interface AuditFilter {
  categories?: AuditCategory[];
  levels?: AuditLogLevel[];
  actions?: AuditAction[];
  actorIds?: string[];
  resourceTypes?: string[];
  resourceIds?: string[];
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Audit statistics
 */
export interface AuditStats {
  totalLogs: number;
  logsToday: number;
  logsThisWeek: number;
  logsThisMonth: number;
  logsByCategory: Record<AuditCategory, number>;
  logsByLevel: Record<AuditLogLevel, number>;
  topActors: Array<{ actorId: string; actorName: string; count: number }>;
  topResources: Array<{ resourceType: string; count: number }>;
  recentCritical: AuditLog[];
}

/**
 * Retention policy
 */
export interface RetentionPolicy {
  id: string;
  name: string;
  category: AuditCategory;
  retentionDays: number;
  autoArchive: boolean;
  autoDelete: boolean;
  complianceRequired: boolean;
}
