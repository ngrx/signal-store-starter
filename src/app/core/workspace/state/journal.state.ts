export interface JournalEntry {
  id: string;
  workspaceId: string;
  content: string;
  createdAt: Date;
  author?: string;
}

export interface JournalStoreState {
  byWorkspace: Record<string, JournalEntry[]>;
  currentWorkspaceId: string | null;
  loading: boolean;
  error: string | null;
}

export const initialJournalStoreState: JournalStoreState = {
  byWorkspace: {},
  currentWorkspaceId: null,
  loading: false,
  error: null,
};
