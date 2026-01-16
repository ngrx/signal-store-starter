/**
 * LayoutStore - NgRx Signals store for layout configuration
 * GlobalShell.Layout = LayoutSignals (layoutMode | sidebarCollapsed | theme)
 * Per prd-sup.md section on GlobalShell.Layout
 */

import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { initialLayoutState } from '../state/layout.state';
import { LayoutMode, Theme, SidebarState, LayoutConfig } from '../models/layout.model';

export const LayoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialLayoutState),
  withComputed(({ config, preferences }) => ({
    // Current settings
    layoutMode: computed(() => config().mode),
    theme: computed(() => config().theme),
    sidebarState: computed(() => config().sidebarState),
    sidebarWidth: computed(() => config().sidebarWidth),
    
    // Convenience flags
    isSidebarExpanded: computed(() => config().sidebarState === 'expanded'),
    isSidebarCollapsed: computed(() => config().sidebarState === 'collapsed'),
    isSidebarHidden: computed(() => config().sidebarState === 'hidden'),
    isDarkMode: computed(() => config().theme === 'dark'),
    isLightMode: computed(() => config().theme === 'light'),
    isAutoTheme: computed(() => config().theme === 'auto'),
    
    // Layout info
    showHeader: computed(() => config().showHeader),
    showFooter: computed(() => config().showFooter),
    contentPadding: computed(() => config().contentPadding),
    
    // Preferences
    persistLayout: computed(() => preferences().persistLayout),
    autoCollapseSidebar: computed(() => preferences().autoCollapseSidebar),
  })),
  withMethods((store) => ({
    // Theme controls
    setTheme(theme: Theme) {
      patchState(store, (state) => ({
        config: { ...state.config, theme },
      }));
      
      // In real implementation, persist to localStorage if preferences.persistLayout is true
      if (store.persistLayout()) {
        localStorage.setItem('app-theme', theme);
      }
    },

    toggleTheme() {
      const current = store.config().theme;
      const next: Theme = current === 'light' ? 'dark' : 'light';
      this.setTheme(next);
    },

    // Sidebar controls
    setSidebarState(state: SidebarState) {
      patchState(store, (currentState) => ({
        config: { ...currentState.config, sidebarState: state },
      }));
      
      if (store.persistLayout()) {
        localStorage.setItem('app-sidebar-state', state);
      }
    },

    toggleSidebar() {
      const current = store.config().sidebarState;
      const next: SidebarState = current === 'expanded' ? 'collapsed' : 'expanded';
      this.setSidebarState(next);
    },

    expandSidebar() {
      this.setSidebarState('expanded');
    },

    collapseSidebar() {
      this.setSidebarState('collapsed');
    },

    hideSidebar() {
      this.setSidebarState('hidden');
    },

    // Layout mode controls
    setLayoutMode(mode: LayoutMode) {
      patchState(store, (state) => ({
        config: { ...state.config, mode },
      }));
      
      if (store.persistLayout()) {
        localStorage.setItem('app-layout-mode', mode);
      }
    },

    // Header/Footer controls
    toggleHeader() {
      patchState(store, (state) => ({
        config: { ...state.config, showHeader: !state.config.showHeader },
      }));
    },

    toggleFooter() {
      patchState(store, (state) => ({
        config: { ...state.config, showFooter: !state.config.showFooter },
      }));
    },

    // Full config update
    updateConfig(updates: Partial<LayoutConfig>) {
      patchState(store, (state) => ({
        config: { ...state.config, ...updates },
      }));
    },

    // Preferences
    setPersistLayout(persist: boolean) {
      patchState(store, (state) => ({
        preferences: { ...state.preferences, persistLayout: persist },
      }));
    },

    setAutoCollapseSidebar(auto: boolean) {
      patchState(store, (state) => ({
        preferences: { ...state.preferences, autoCollapseSidebar: auto },
      }));
    },

    // Reset to defaults
    resetLayout() {
      patchState(store, initialLayoutState);
      
      // Clear localStorage
      localStorage.removeItem('app-theme');
      localStorage.removeItem('app-sidebar-state');
      localStorage.removeItem('app-layout-mode');
    },
  })),
  withHooks({
    onInit(store) {
      // Load persisted layout preferences from localStorage
      if (store.persistLayout()) {
        const savedTheme = localStorage.getItem('app-theme') as Theme;
        const savedSidebarState = localStorage.getItem('app-sidebar-state') as SidebarState;
        const savedLayoutMode = localStorage.getItem('app-layout-mode') as LayoutMode;
        
        if (savedTheme) store.setTheme(savedTheme);
        if (savedSidebarState) store.setSidebarState(savedSidebarState);
        if (savedLayoutMode) store.setLayoutMode(savedLayoutMode);
      }
    },
  })
);
