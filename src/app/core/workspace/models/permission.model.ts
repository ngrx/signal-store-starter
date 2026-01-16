/**
 * Permission domain models
 * Per prd-sup.md: Module.permissions = AccessControl (Role | Policy | Scope | Inheritance | Override)
 */

export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'admin' | 'invite' | 'export' | 'configure';
export type PermissionResource = 'workspace' | 'module' | 'document' | 'task' | 'member' | 'setting' | 'audit';
export type PermissionScope = 'workspace' | 'module' | 'entity' | 'custom';
export type PermissionEffect = 'allow' | 'deny';

/**
 * Role definition
 */
export interface Role {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  isSystemRole: boolean;  // Owner, Admin, Member, Guest are system roles
  permissions: Permission[];
  memberCount: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  workspaceId: string;

  // Subject (who has the permission)
  subjectType: 'user' | 'team' | 'role';
  subjectId: string;

  // Resource (what the permission applies to)
  resource: PermissionResource;
  resourceId?: string;  // Specific resource ID, or null for all

  // Action & Effect
  action: PermissionAction;
  effect: PermissionEffect;

  // Scope & Inheritance
  scope: PermissionScope;
  inheritsFrom?: string;  // Parent permission ID
  canOverride: boolean;

  // Conditions
  conditions?: PermissionCondition[];

  // Metadata
  createdAt: Date;
  createdBy: string;
  expiresAt?: Date;
}

/**
 * Permission condition (e.g., time-based, location-based)
 */
export interface PermissionCondition {
  type: 'time' | 'location' | 'custom';
  operator: 'equals' | 'contains' | 'between' | 'matches';
  value: any;
}

/**
 * Permission policy (collection of permissions)
 */
export interface PermissionPolicy {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  permissions: Permission[];
  appliesTo: {
    type: 'user' | 'team' | 'role';
    id: string;
  }[];
  isActive: boolean;
  priority: number;  // Higher priority policies override lower ones
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  matchedPermissions: Permission[];
  inheritedFrom?: string;
}

/**
 * Permission matrix for UI display
 */
export interface PermissionMatrix {
  roles: Role[];
  resources: PermissionResource[];
  permissions: Record<string, Record<PermissionResource, PermissionAction[]>>;  // roleId -> resource -> actions[]
}

/**
 * Permission audit entry
 */
export interface PermissionAudit {
  id: string;
  workspaceId: string;
  action: 'grant' | 'revoke' | 'modify' | 'check';
  subjectId: string;
  subjectType: 'user' | 'team' | 'role';
  resourceType: PermissionResource;
  resourceId?: string;
  permissionId?: string;
  result: 'allowed' | 'denied';
  performedBy: string;
  performedAt: Date;
  metadata?: Record<string, any>;
}
