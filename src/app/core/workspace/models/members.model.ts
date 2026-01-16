/**
 * Workspace Members Models
 * Module.members = IdentityMapping (User | Team | Partner | Role | Invitation | Onboarding)
 * Per prd-sup.md section on Module.members
 */

export type MembershipRole = 'Owner' | 'Admin' | 'Member' | 'Guest' | 'Bot';
export type MembershipStatus = 'Active' | 'Invited' | 'Suspended' | 'Archived';

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  
  // Identity reference
  accountId: string;
  accountType: 'user' | 'team' | 'partner' | 'bot';
  
  // Display info
  displayName: string;
  email?: string;
  avatarUrl?: string;
  
  // Membership details
  role: MembershipRole;
  status: MembershipStatus;
  permissions: string[]; // Specific permission overrides
  
  // Relationship
  invitedBy?: string;
  joinedAt: Date;
  lastActiveAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  
  // Invitee info
  email: string;
  targetRole: MembershipRole;
  
  // Invitation details
  invitedBy: string;
  invitedByName: string;
  invitedAt: Date;
  expiresAt: Date;
  
  // Status
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  acceptedAt?: Date;
  
  // Metadata
  message?: string;
  inviteLink?: string;
}

export interface MemberOnboarding {
  id: string;
  workspaceId: string;
  memberId: string;
  
  // Progress tracking
  steps: OnboardingStep[];
  currentStepIndex: number;
  completed: boolean;
  completedAt?: Date;
  
  // Metadata
  startedAt: Date;
  updatedAt: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
  order: number;
}
