export interface Project {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  teamId?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'archived';
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  organizationId?: string;
  teamId?: string;
}

export const applyProjectScopes = (payload: { organizationId?: string; teamId?: string }) => ({
  ...(payload.organizationId ? { organizationId: payload.organizationId } : {}),
  ...(payload.teamId ? { teamId: payload.teamId } : {}),
});
