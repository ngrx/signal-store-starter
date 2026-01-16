/**
 * WorkspaceList State
 * Per prd-sup.md section on WorkspaceListStore
 */

import { WorkspaceListItem, RecentWorkspace, FavoriteWorkspace } from '../models/workspace-list.model';

export interface WorkspaceListState {
  // All workspaces the user has access to
  workspaces: WorkspaceListItem[];
  
  // Workspace lookup by ID
  workspaceById: Record<string, WorkspaceListItem>;
  
  // Current selected workspace ID
  currentWorkspaceId: string | null;
  
  // Recent workspaces
  recentWorkspaces: RecentWorkspace[];
  
  // Favorite workspaces
  favoriteWorkspaces: FavoriteWorkspace[];
  
  // Loading and error states
  loading: boolean;
  error: string | null;
}

export const initialWorkspaceListState: WorkspaceListState = {
  workspaces: [],
  workspaceById: {},
  currentWorkspaceId: null,
  recentWorkspaces: [],
  favoriteWorkspaces: [],
  loading: false,
  error: null,
};
