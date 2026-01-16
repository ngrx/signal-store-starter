/**
 * Layout State
 * Per prd-sup.md section on GlobalShell.Layout
 */

import { LayoutConfig, Theme, LayoutMode, SidebarState } from '../models/layout.model';

export interface LayoutState {
  config: LayoutConfig;
  preferences: {
    persistLayout: boolean;
    autoCollapseSidebar: boolean;
  };
  isAnimating: boolean;
}

export const defaultLayoutConfig: LayoutConfig = {
  mode: 'default',
  theme: 'light',
  sidebarState: 'expanded',
  showHeader: true,
  showFooter: false,
  sidebarWidth: 256,
  contentPadding: 16,
};

export const initialLayoutState: LayoutState = {
  config: defaultLayoutConfig,
  preferences: {
    persistLayout: true,
    autoCollapseSidebar: false,
  },
  isAnimating: false,
};
