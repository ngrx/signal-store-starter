/**
 * Workspace = LogicalContainer (Resources | Permissions | Modules | SharedContext)
 * Maps to @angular/fire/firestore (Document | SubCollection | RuleScope)
 */

export interface Workspace {
  id: string;
  organizationId: string;
  name: string;
  displayName: string;
  description?: string;
  
  // Ownership
  ownerId: string;
  
  // Settings
  settings?: WorkspaceSettings;
  
  // Modules enabled
  modules: {
    overview: boolean;
    documents: boolean;
    tasks: boolean;
    members: boolean;
    permissions: boolean;
    audit: boolean;
    settings: boolean;
    journal: boolean;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  
  // Status
  status: 'active' | 'archived' | 'suspended';
  
  // Resources
  resourceCount?: {
    documents: number;
    tasks: number;
    members: number;
  };
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
