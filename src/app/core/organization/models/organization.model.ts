/**
 * Organization Account
 * Represents an organizational identity in the system
 */

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  
  // Contact information
  email?: string;
  website?: string;
  
  // Settings
  settings?: OrganizationSettings;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Status
  status: 'active' | 'suspended' | 'inactive';
  
  // Branding
  logoURL?: string;
  primaryColor?: string;
}

export interface OrganizationSettings {
  allowTeamCreation: boolean;
  allowPartnerInvitation: boolean;
  requireEmailVerification: boolean;
  defaultWorkspaceQuota: number;
  
  // Feature flags
  features?: {
    documentsEnabled: boolean;
    tasksEnabled: boolean;
    auditEnabled: boolean;
    journalEnabled: boolean;
  };
}

export interface OrganizationMember {
  userId: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
  invitedBy?: string;
}
