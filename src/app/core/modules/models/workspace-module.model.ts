export type WorkspaceModuleType =
  | 'overview'
  | 'documents'
  | 'tasks'
  | 'members'
  | 'permissions'
  | 'audit'
  | 'settings'
  | 'journal';

export interface WorkspaceModuleDescriptor {
  id: WorkspaceModuleType;
  label: string;
  icon: string;
  route: string;
  enabled: boolean;
}

export interface ModuleState {
  registered: WorkspaceModuleDescriptor[];
}

export const defaultModules: WorkspaceModuleDescriptor[] = [
  { id: 'overview', label: 'Overview', icon: '📊', route: '/workspace/overview', enabled: true },
  { id: 'documents', label: 'Documents', icon: '📄', route: '/workspace/documents', enabled: true },
  { id: 'tasks', label: 'Tasks', icon: '✅', route: '/workspace/tasks', enabled: true },
  { id: 'members', label: 'Members', icon: '👥', route: '/workspace/members', enabled: true },
  { id: 'permissions', label: 'Permissions', icon: '🔒', route: '/workspace/permissions', enabled: true },
  { id: 'audit', label: 'Audit', icon: '🕑', route: '/workspace/audit', enabled: true },
  { id: 'settings', label: 'Settings', icon: '⚙️', route: '/workspace/settings', enabled: true },
  { id: 'journal', label: 'Journal', icon: '📝', route: '/workspace/journal', enabled: true },
];

export const initialModuleState: ModuleState = {
  registered: defaultModules,
};
