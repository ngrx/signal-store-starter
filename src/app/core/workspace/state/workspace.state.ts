import { Workspace } from '../models/workspace.model';

export interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  error: string | null;
}

export const initialWorkspaceState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  loading: false,
  error: null,
};
