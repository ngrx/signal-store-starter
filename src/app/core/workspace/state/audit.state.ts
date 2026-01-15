export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  action: string;
  actor?: string;
  createdAt: Date;
}

export interface AuditStoreState {
  byWorkspace: Record<string, AuditLogEntry[]>;
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuditStoreState: AuditStoreState = {
  byWorkspace: {},
  currentWorkspaceId: null,
  loading: false,
  error: null,
};
