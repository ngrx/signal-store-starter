/**
 * Menu models for dynamic navigation
 * Menu items are computed based on current context and permissions
 */

export type MenuItemType = 'link' | 'action' | 'divider' | 'header';
export type ContextType = 'user' | 'organization' | 'team' | 'partner';
export type WorkspaceModule = 
  | 'overview' 
  | 'documents' 
  | 'tasks' 
  | 'members' 
  | 'permissions' 
  | 'audit' 
  | 'settings' 
  | 'journal';

export interface MenuItem {
  id: string;
  type: MenuItemType;
  label?: string;
  icon?: string;
  route?: string;
  action?: () => void;
  visible?: boolean;
  disabled?: boolean;
  badge?: string | number;
  children?: MenuItem[];
  module?: WorkspaceModule;
  requiredRole?: string[];
  requiredPermission?: string[];
  contextType?: ContextType;
  requiredContext?: ContextType[];
}

export interface MenuSection {
  id: string;
  title?: string;
  items: MenuItem[];
  visible?: boolean;
}

export interface DynamicMenu {
  sections: MenuSection[];
  contextName?: string;
  contextType?: string;
}

export interface ContextMenuConfig {
  contextType: ContextType;
  contextId: string;
  contextName: string;
}

export interface MenuPermission {
  module: WorkspaceModule;
  actions: string[];
  roles: string[];
}

export const WORKSPACE_MODULES: WorkspaceModule[] = [
  'overview',
  'documents',
  'tasks',
  'members',
  'permissions',
  'audit',
  'settings',
  'journal',
];

export const MODULE_ICONS: Record<WorkspaceModule, string> = {
  overview: '📊',
  documents: '📄',
  tasks: '✓',
  members: '👥',
  permissions: '🔒',
  audit: '📋',
  settings: '⚙️',
  journal: '📖',
};

export const MODULE_LABELS: Record<WorkspaceModule, string> = {
  overview: 'Overview',
  documents: 'Documents',
  tasks: 'Tasks',
  members: 'Members',
  permissions: 'Permissions',
  audit: 'Audit Log',
  settings: 'Settings',
  journal: 'Activity Journal',
};
