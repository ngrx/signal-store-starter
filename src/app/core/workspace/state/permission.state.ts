export interface WorkspacePermission {
  id: string;
  workspaceId: string;
  role: string;
  principal: string;
}

export interface PermissionStoreState {
  byWorkspace: Record<string, WorkspacePermission[]>;
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialPermissionStoreState: PermissionStoreState = {
  byWorkspace: {},
  currentWorkspaceId: null,
  loading: false,
  error: null,
};
