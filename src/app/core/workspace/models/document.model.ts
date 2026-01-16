/**
 * Document domain models
 * Per prd-sup.md: Module.documents = ContentManagement (File | Folder | Version | Permission | Sharing)
 */

export type DocumentType = 'file' | 'folder' | 'link' | 'embed';
export type DocumentStatus = 'draft' | 'published' | 'archived' | 'deleted';
export type DocumentPermission = 'view' | 'comment' | 'edit' | 'admin';
export type DocumentVersion = {
  id: string;
  number: number;
  createdAt: Date;
  createdBy: string;
  size: number;
  changeLog?: string;
};

/**
 * Document entity representing a file or folder in the workspace
 */
export interface Document {
  // Entity Identity
  id: string;
  workspaceId: string;
  type: DocumentType;
  status: DocumentStatus;

  // Content
  name: string;
  description?: string;
  mimeType?: string;
  size: number;
  url?: string;
  thumbnailUrl?: string;

  // Folder structure
  parentId?: string;
  path: string;
  depth: number;

  // Versioning
  version: number;
  versions: DocumentVersion[];

  // Permissions & Sharing
  ownerId: string;
  ownerName: string;
  permissions: DocumentPermission[];
  sharedWith: string[];  // User/team IDs
  isPublic: boolean;

  // Metadata
  tags: string[];
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  lastAccessedAt?: Date;

  // Collaboration
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: Date;
  commentCount: number;
}

/**
 * Document statistics for the workspace
 */
export interface DocumentStats {
  totalDocuments: number;
  totalFolders: number;
  totalFiles: number;
  totalSize: number;
  documentsByType: Record<DocumentType, number>;
  documentsByStatus: Record<DocumentStatus, number>;
  recentDocuments: number;
}

/**
 * Document filter criteria
 */
export interface DocumentFilter {
  type?: DocumentType[];
  status?: DocumentStatus[];
  ownerId?: string;
  parentId?: string;
  tags?: string[];
  searchQuery?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Document sort options
 */
export type DocumentSortField = 'name' | 'createdAt' | 'updatedAt' | 'size' | 'type';
export type DocumentSortDirection = 'asc' | 'desc';

export interface DocumentSort {
  field: DocumentSortField;
  direction: DocumentSortDirection;
}
