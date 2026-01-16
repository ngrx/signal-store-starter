/**
 * Workspace = LogicalContainer (Resources | Permissions | Modules | SharedContext)
 * Maps to @angular/fire/firestore (Document | SubCollection | RuleScope)
 */

export interface Workspace {
  id: string;
  organizationId?: string;
  teamId?: string;
  partnerId?: string;
  name: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  contextRef?: {
    type: 'personal' | 'organization' | 'team' | 'partner';
    id: string;
  };
  ownerId?: string;
  settings?: WorkspaceSettings;
  modules?: {
    overview: boolean;
    documents: boolean;
    tasks: boolean;
    members: boolean;
    permissions: boolean;
    audit: boolean;
    settings: boolean;
    journal: boolean;
  };
  createdAt?: Date;
  updatedAt?: Date;
  lastAccessedAt?: Date;
  status?: 'active' | 'archived' | 'suspended';
  resourceCount?: {
    documents: number;
    tasks: number;
    members: number;
  };
  type?: 'project' | 'department' | 'client' | 'campaign' | 'product' | 'internal';
}

export interface WorkspaceSettings {
  visibility: 'private' | 'internal' | 'public';
  allowGuestAccess: boolean;
  requireApprovalForJoin: boolean;
  defaultPermissions: string[];
}

export interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  permissions: string[];
  joinedAt: Date;
  invitedBy?: string;
}

export interface WorkspaceContext {
  workspaceId: string;
  eventBusEnabled: boolean;
  sharedSchemaVersion: string;
  integrations?: string[];
}
