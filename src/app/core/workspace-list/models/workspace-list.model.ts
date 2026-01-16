/**
 * WorkspaceList Models
 * WorkspaceList = AccountWorkspaces (OwnedWorkspaces | MemberWorkspaces | ArchivedWorkspaces)
 * Per prd-sup.md section on WorkspaceList
 */

import { Workspace } from '../../workspace/models/workspace.model';

export type WorkspaceRole = 'Owner' | 'Admin' | 'Member' | 'Guest' | 'Bot';
export type WorkspaceStatus = 'Active' | 'Invited' | 'Suspended' | 'Archived';

export interface WorkspaceMembership {
  workspaceId: string;
  accountId: string;
  role: WorkspaceRole;
  status: WorkspaceStatus;
  permissions: string[];
  invitedBy?: string;
  joinedAt: Date;
  lastAccessedAt?: Date;
}

export interface WorkspaceListItem extends Workspace {
  membership?: WorkspaceMembership;
  isFavorite: boolean;
  lastAccessedAt?: Date;
  unreadCount?: number;
}

export interface RecentWorkspace {
  workspaceId: string;
  name: string;
  lastAccessedAt: Date;
  accessCount: number;
}

export interface FavoriteWorkspace {
  workspaceId: string;
  name: string;
  addedAt: Date;
  order: number;
}
