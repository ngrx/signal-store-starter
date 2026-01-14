/**
 * Team = SubUnit (Internal)
 * Maps to @angular/fire/firestore (Collection | Query | SecurityRule)
 */

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  displayName: string;
  description?: string;
  
  // Team type
  type: 'internal';
  
  // Members
  memberCount: number;
  
  // Settings
  visibility: 'public' | 'private' | 'secret';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Status
  status: 'active' | 'archived';
}

export interface TeamMember {
  userId: string;
  teamId: string;
  role: 'lead' | 'member';
  joinedAt: Date;
  addedBy?: string;
}

export interface TeamPermissions {
  teamId: string;
  workspaceId: string;
  permissions: string[]; // e.g., ['read', 'write', 'admin']
  grantedAt: Date;
  grantedBy: string;
}
