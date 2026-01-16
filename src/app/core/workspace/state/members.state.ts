/**
 * State definitions for workspace members module
 * Following NgRx Signals patterns per prd-sup.md
 */

import { WorkspaceMember, WorkspaceInvitation, MemberOnboarding } from '../models/members.model';

export interface MembersState {
  // Members by workspace
  byWorkspace: Record<string, WorkspaceMember[]>;
  
  // Invitations by workspace
  invitationsByWorkspace: Record<string, WorkspaceInvitation[]>;
  
  // Onboarding by workspace
  onboardingByWorkspace: Record<string, MemberOnboarding[]>;
  
  // Current workspace being viewed
  currentWorkspaceId: string | null;
  
  // Selected member for detail view
  selectedMemberId: string | null;
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

export const initialMembersState: MembersState = {
  byWorkspace: {},
  invitationsByWorkspace: {},
  onboardingByWorkspace: {},
  currentWorkspaceId: null,
  selectedMemberId: null,
  loading: false,
  error: null,
};
