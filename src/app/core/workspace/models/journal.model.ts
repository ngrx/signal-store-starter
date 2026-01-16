// Journal model definitions for workspace activity logging
export interface JournalEntry {
  id: string;
  workspaceId: string;
  timestamp: Date;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface JournalFilter {
  workspaceId?: string;
  userId?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
}
