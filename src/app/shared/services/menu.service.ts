import { Injectable, inject, computed, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@angular/fire/auth';
import { ContextStore, ContextStoreInstance } from '../../core/context/stores/context.store';
import { AuthStore, AuthStoreInstance } from '../../core/auth/stores/auth.store';
import {
  DynamicMenu,
  MenuItem,
  MenuSection,
  WORKSPACE_MODULES,
  MODULE_ICONS,
  MODULE_LABELS,
  WorkspaceModule,
} from '../models/menu.model';
import {
  AppContext,
  OrganizationContext,
  PartnerContext,
  TeamContext,
} from '../../core/context/models/context.model';
import { workspaceIdFromContext } from '../../core/workspace/stores/workspace.store';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private contextStore = inject<ContextStoreInstance>(ContextStore);
  private authStore = inject<AuthStoreInstance>(AuthStore);
  private router = inject(Router);

  /**
   * Computed signal for dynamic menu based on current context and route
   * Per prd-sup.md: Account → WorkspaceList → Workspace → Module
   * - Global navigation when NOT in workspace
   * - Module navigation when INSIDE workspace
   */
  menu: Signal<DynamicMenu> = computed(() => {
    const context = this.contextStore.current();
    const isAuthenticated = this.authStore.isAuthenticated();

    if (!isAuthenticated) {
      return { sections: [] };
    }

    if (!context) {
      return this.buildFallbackMenuForUser(this.authStore.user());
    }

    return this.buildMenuForContext(context);
  });

  /**
   * Check if current route is inside a workspace detail view
   * Pattern: /workspace/:workspaceId/:module
   */
  private isInWorkspaceDetailRoute = computed(() => {
    const url = this.router.url;
    // Match pattern like /workspace/ws-123/overview or /workspace/ws-123/documents
    const workspaceModulePattern = /^\/workspace\/[^\/]+\/(overview|documents|tasks|members|permissions|audit|settings|journal)/;
    return workspaceModulePattern.test(url);
  });

  /**
   * Build menu structure based on current route and context
   * Per prd-sup.md architecture:
   * - BEFORE workspace selection: Show global navigation (Dashboard, My Workspaces)
   * - AFTER workspace selection: Show workspace modules (Overview, Documents, Tasks, etc.)
   * - Context switching is HEADER-ONLY, not in sidebar
   */
  private buildMenuForContext(context: AppContext): DynamicMenu {
    const sections: MenuSection[] = [];

    // Check if user is inside a workspace detail route
    const isInWorkspace = this.isInWorkspaceDetailRoute();

    if (isInWorkspace) {
      // LAYER 4: Module Navigation - User is inside a workspace
      // Show ONLY workspace modules
      sections.push(this.buildWorkspaceModulesSection(context));
    } else {
      // LAYER 1-2: Global/Context Navigation - User is at dashboard or workspace list level
      // Show standard navigation items
      sections.push(this.buildGlobalNavigation(context));
    }

    // User profile section (always visible)
    sections.push(this.buildUserSection());

    return {
      sections,
      contextName: this.getContextName(context),
      contextType: context.type,
    };
  }

  /**
   * Build global navigation section
   * This is shown when NOT inside a workspace (dashboard, workspace list, etc.)
   * Same navigation items regardless of context type
   */
  private buildGlobalNavigation(context: AppContext): MenuSection {
    return {
      id: 'global-nav',
      title: 'Navigation',
      items: [
        {
          id: 'dashboard',
          type: 'link',
          label: 'Dashboard',
          icon: '📊',
          route: '/dashboard',
          visible: true,
        },
        {
          id: 'my-workspaces',
          type: 'link',
          label: 'My Workspaces',
          icon: '📂',
          route: '/workspace',
          visible: true,
        },
      ],
      visible: true,
    };
  }

  /**
   * Build workspace modules section
   * ONLY shown when inside /workspace/:id/:module route
   */
  private buildWorkspaceModulesSection(context: AppContext): MenuSection {
    const items: MenuItem[] = WORKSPACE_MODULES.map((module) => {
      const baseRoute = this.getBaseRouteForContext(context);
      return {
        id: `module-${module}`,
        type: 'link',
        label: MODULE_LABELS[module],
        icon: MODULE_ICONS[module],
        route: `${baseRoute}/${module}`,
        module,
        visible: this.isModuleVisible(module, context),
        disabled: !this.hasModulePermission(module, context),
      };
    });

    return {
      id: 'workspace-modules',
      title: 'Workspace Modules',
      items,
      visible: true,
    };
  }

  /**
   * Build user section (profile, settings, logout)
   */
  private buildUserSection(): MenuSection {
    return {
      id: 'user-section',
      items: [
        {
          id: 'user-divider',
          type: 'divider',
        },
        {
          id: 'profile',
          type: 'link',
          label: 'Profile',
          icon: '👤',
          route: '/profile',
          visible: true,
        },
        {
          id: 'settings',
          type: 'link',
          label: 'Settings',
          icon: '⚙️',
          route: '/settings',
          visible: true,
        },
        {
          id: 'logout',
          type: 'action',
          label: 'Logout',
          icon: '🚪',
          action: () => this.authStore.logout(),
          visible: true,
        },
      ],
      visible: true,
    };
  }

  /**
   * Fallback menu shown when context is not yet available but user is authenticated.
   * Guarantees the dropdown renders logout and a quick navigation target.
   */
  private buildFallbackMenuForUser(user: User | null): DynamicMenu {
    return {
      sections: [
        {
          id: 'fallback-nav',
          title: 'Navigation',
          items: [
            {
              id: 'fallback-dashboard',
              type: 'link',
              label: 'Dashboard',
              icon: '📊',
              route: '/dashboard',
              visible: true,
            },
            {
              id: 'fallback-my-workspace',
              type: 'link',
              label: 'My Workspace',
              icon: '📂',
              route: '/workspace',
              visible: true,
            },
          ],
          visible: true,
        },
        {
          id: 'fallback-user-section',
          items: [
            {
              id: 'user-divider',
              type: 'divider',
            },
            {
              id: 'profile',
              type: 'link',
              label: 'Profile',
              icon: '👤',
              route: '/profile',
              visible: true,
            },
            {
              id: 'settings',
              type: 'link',
              label: 'Settings',
              icon: '⚙️',
              route: '/settings',
              visible: true,
            },
            {
              id: 'logout',
              type: 'action',
              label: 'Logout',
              icon: '🚪',
              action: () => this.authStore.logout(),
              visible: true,
            },
          ],
          visible: true,
        },
      ],
      contextName: user?.email || 'Account',
      contextType: 'user',
    };
  }

  /**
   * Get base route for context
   */
  private getBaseRouteForContext(context: AppContext): string {
    const workspaceId = workspaceIdFromContext(context);
    return `/workspace/${workspaceId}`;
  }

  /**
   * Check if module is visible for context
   */
  private isModuleVisible(module: WorkspaceModule, context: AppContext): boolean {
    // All modules visible for organization owners/admins
    if (context.type === 'organization') {
      const role = (context as any).role;
      if (role === 'owner' || role === 'admin') return true;
    }

    // Limit certain modules for partners
    if (context.type === 'partner') {
      const restrictedModules: WorkspaceModule[] = ['permissions', 'audit', 'settings'];
      if (restrictedModules.includes(module)) {
        return (context as any).accessLevel === 'full';
      }
    }

    // Limit certain modules for team members
    if (context.type === 'team') {
      const restrictedModules: WorkspaceModule[] = ['permissions', 'settings'];
      if (restrictedModules.includes(module)) {
        return (context as any).role === 'lead';
      }
    }

    return true;
  }

  /**
   * Check if user has permission for module
   */
  private hasModulePermission(module: WorkspaceModule, context: AppContext): boolean {
    // Simple permission check based on context
    // In a real app, this would check against a permission service
    return this.isModuleVisible(module, context);
  }

  /**
   * Get context name for display
   */
  private getContextName(context: AppContext): string {
    switch (context.type) {
      case 'user':
        return context.email;
      case 'organization':
      case 'team':
      case 'partner':
        return (context as any).name;
      default:
        return 'Unknown';
    }
  }
}
