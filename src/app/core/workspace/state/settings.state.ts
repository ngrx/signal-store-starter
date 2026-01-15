export interface WorkspaceSettingsState {
  workspaceId: string;
  theme?: 'light' | 'dark';
  timezone?: string;
}

export interface SettingsStoreState {
  byWorkspace: Record<string, WorkspaceSettingsState>;
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialSettingsStoreState: SettingsStoreState = {
  byWorkspace: {},
  currentWorkspaceId: null,
  loading: false,
  error: null,
};
