/**
 * Context models for dynamic menu and context switching
 * Represents the current user's active context (User, Organization, Team, Partner)
 */

export type ContextType = 'user' | 'organization' | 'team' | 'partner';

export interface ContextSwitchEvent {
  type: ContextType;
  id: string;
  timestamp: number;
}

export interface UserContext {
  type: 'user';
  userId: string;
  email: string;
  displayName: string | null;
}

export interface OrganizationContext {
  type: 'organization';
  organizationId: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
}

export interface TeamContext {
  type: 'team';
  teamId: string;
  organizationId: string;
  name: string;
  role: 'lead' | 'member';
}

export interface PartnerContext {
  type: 'partner';
  partnerId: string;
  organizationId: string;
  name: string;
  accessLevel: 'full' | 'limited' | 'readonly';
}

export type AppContext = UserContext | OrganizationContext | TeamContext | PartnerContext;

export interface ContextState {
  current: AppContext | null;
  available: {
    organizations: OrganizationContext[];
    teams: TeamContext[];
    partners: PartnerContext[];
  };
  history: ContextSwitchEvent[];
}
