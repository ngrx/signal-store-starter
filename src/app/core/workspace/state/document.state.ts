export interface WorkspaceDocument {
  id: string;
  workspaceId: string;
  title: string;
  path?: string;
  updatedAt: Date;
}

export interface DocumentStoreState {
  byWorkspace: Record<string, WorkspaceDocument[]>;
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialDocumentStoreState: DocumentStoreState = {
  byWorkspace: {},
  currentWorkspaceId: null,
  loading: false,
  error: null,
};
