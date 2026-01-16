/**
 * Layout Models
 * GlobalShell.Layout = LayoutSignals (layoutMode | sidebarCollapsed | theme)
 * Per prd-sup.md section on GlobalShell
 */

export type LayoutMode = 'default' | 'compact' | 'comfortable' | 'spacious';
export type Theme = 'light' | 'dark' | 'auto';
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

export interface LayoutConfig {
  mode: LayoutMode;
  theme: Theme;
  sidebarState: SidebarState;
  showHeader: boolean;
  showFooter: boolean;
  sidebarWidth: number;
  contentPadding: number;
}

export interface LayoutPreferences {
  userId: string;
  preferredMode: LayoutMode;
  preferredTheme: Theme;
  preferredSidebarState: SidebarState;
  autoCollapseSidebar: boolean;
  persistLayout: boolean;
}
