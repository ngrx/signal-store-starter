/**
 * Partner = SubUnit (External)
 * Maps to @angular/fire/firestore (Collection | WebhookBinding | AccessRule)
 */

export interface Partner {
  id: string;
  organizationId: string;
  name: string;
  displayName: string;
  description?: string;
  
  // Partner type
  type: 'external';
  
  // External organization info
  externalOrganizationId?: string;
  externalOrganizationName?: string;
  
  // Contact
  contactEmail?: string;
  contactPerson?: string;
  
  // Integration
  webhookUrl?: string;
  apiKey?: string; // Encrypted
  
  // Settings
  accessLevel: 'read' | 'write' | 'admin';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  
  // Status
  status: 'active' | 'suspended' | 'inactive';
}

export interface PartnerAccess {
  partnerId: string;
  workspaceId: string;
  permissions: string[];
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
}

export interface PartnerWebhook {
  partnerId: string;
  url: string;
  events: string[]; // e.g., ['document.created', 'task.updated']
  secret: string; // For HMAC verification
  status: 'active' | 'inactive';
  createdAt: Date;
}
