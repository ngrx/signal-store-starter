import { Injectable, inject, computed, Signal } from '@angular/core';
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

  /**
   * Computed signal for dynamic menu based on current context
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
   * Build menu structure based on context type
   */
  private buildMenuForContext(context: AppContext): DynamicMenu {
    const sections: MenuSection[] = [];

    // Context switcher section
    if (this.contextStore.canSwitchContext()) {
      sections.push(this.buildContextSwitcherSection());
    }

    // Main navigation section based on context type
    switch (context.type) {
      case 'user':
        sections.push(this.buildUserMenu());
        break;
      case 'organization':
        sections.push(this.buildOrganizationMenu(context));
        break;
      case 'team':
        sections.push(this.buildTeamMenu(context));
        break;
      case 'partner':
        sections.push(this.buildPartnerMenu(context));
        break;
    }

    // Workspace modules section is ONLY shown in workspace detail view, not in global sidebar
    // Per prd-sup.md Lines 74-76: "Modules ONLY appear after selecting a workspace"
    // Removed from global menu - workspace navigation handled by workspace detail component

    // Settings and user menu
    sections.push(this.buildUserSection());

    return {
      sections,
      contextName: this.getContextName(context),
      contextType: context.type,
    };
  }

  /**
   * Build context switcher section (hierarchical, context-aware)
   * Follows prd-sup.md architecture: User → Organization → Team/Partner
   */
  private buildContextSwitcherSection(): MenuSection {
    const currentContext = this.contextStore.current();
    const items: MenuItem[] = [];

    // Switch based on current context type for hierarchical UI
    switch (currentContext?.type) {
      case 'user':
        // Personal view: Show only "Switch to Organization" option
        items.push(
          {
            id: 'context-header',
            type: 'header',
            label: 'Switch Context',
          },
          {
            id: 'context-current',
            type: 'header',
            label: '👤 Personal',
          },
          {
            id: 'context-divider-1',
            type: 'divider',
          }
        );

        // List all available organizations
        const orgs = this.contextStore.available().organizations;
        if (orgs.length > 0) {
          items.push({
            id: 'switch-to-org-header',
            type: 'header',
            label: 'Organizations',
          });
          orgs.forEach((org: OrganizationContext) => {
            items.push({
              id: `context-org-${org.organizationId}`,
              type: 'action',
              label: org.name,
              icon: '🏢',
              action: () => this.contextStore.switchContext(org),
              visible: true,
            });
          });
        }
        break;

      case 'organization':
        // Organization view: Show current org + back button + switch org dropdown + teams/partners in current org
        items.push(
          {
            id: 'context-header',
            type: 'header',
            label: 'Current Context',
          },
          {
            id: 'context-current',
            type: 'header',
            label: `🏢 ${(currentContext as any).name}`,
          },
          {
            id: 'context-back',
            type: 'action',
            label: '← Back to Personal',
            action: () => this.contextStore.navigateBack(),
            visible: true,
          },
          {
            id: 'context-divider-1',
            type: 'divider',
          }
        );

        // Show teams in current organization
        const teamsInOrg = this.contextStore.teamsInCurrentOrg();
        if (teamsInOrg.length > 0) {
          items.push({
            id: 'switch-to-team-header',
            type: 'header',
            label: 'Teams',
          });
          teamsInOrg.forEach((team: TeamContext) => {
            items.push({
              id: `context-team-${team.teamId}`,
              type: 'action',
              label: team.name,
              icon: '👥',
              action: () => this.contextStore.switchContext(team),
              visible: true,
            });
          });
        }

        // Show partners in current organization
        const partnersInOrg = this.contextStore.partnersInCurrentOrg();
        if (partnersInOrg.length > 0) {
          if (teamsInOrg.length > 0) {
            items.push({
              id: 'context-divider-partners',
              type: 'divider',
            });
          }
          items.push({
            id: 'switch-to-partner-header',
            type: 'header',
            label: 'Partners',
          });
          partnersInOrg.forEach((partner: PartnerContext) => {
            items.push({
              id: `context-partner-${partner.partnerId}`,
              type: 'action',
              label: partner.name,
              icon: '🤝',
              action: () => this.contextStore.switchContext(partner),
              visible: true,
            });
          });
        }

        // Show other organizations (switch org)
        const allOrgs = this.contextStore.available().organizations;
        const otherOrgs = allOrgs.filter(
          (org: OrganizationContext) => org.organizationId !== (currentContext as any).organizationId
        );
        if (otherOrgs.length > 0) {
          items.push(
            {
              id: 'context-divider-other-orgs',
              type: 'divider',
            },
            {
              id: 'other-orgs-header',
              type: 'header',
              label: 'Switch Organization',
            }
          );
          otherOrgs.forEach((org: OrganizationContext) => {
            items.push({
              id: `context-org-${org.organizationId}`,
              type: 'action',
              label: org.name,
              icon: '🏢',
              action: () => this.contextStore.switchContext(org),
              visible: true,
            });
          });
        }
        break;

      case 'team':
        // Team view: Show current team + back button + teams in current org only
        items.push(
          {
            id: 'context-header',
            type: 'header',
            label: 'Current Context',
          },
          {
            id: 'context-current',
            type: 'header',
            label: `👥 ${(currentContext as any).name}`,
          },
          {
            id: 'context-back',
            type: 'action',
            label: '← Back to Organization',
            action: () => this.contextStore.navigateBack(),
            visible: true,
          },
          {
            id: 'context-divider-1',
            type: 'divider',
          }
        );

        // Show other teams in same organization
        const teamsInSameOrg = this.contextStore.teamsInCurrentOrg();
        const otherTeams = teamsInSameOrg.filter(
          (team: TeamContext) => team.teamId !== (currentContext as any).teamId
        );
        if (otherTeams.length > 0) {
          items.push({
            id: 'switch-team-header',
            type: 'header',
            label: 'Switch Team',
          });
          otherTeams.forEach((team: TeamContext) => {
            items.push({
              id: `context-team-${team.teamId}`,
              type: 'action',
              label: team.name,
              icon: '👥',
              action: () => this.contextStore.switchContext(team),
              visible: true,
            });
          });
        }
        break;

      case 'partner':
        // Partner view: Show current partner + back button + partners in current org only
        items.push(
          {
            id: 'context-header',
            type: 'header',
            label: 'Current Context',
          },
          {
            id: 'context-current',
            type: 'header',
            label: `🤝 ${(currentContext as any).name}`,
          },
          {
            id: 'context-back',
            type: 'action',
            label: '← Back to Organization',
            action: () => this.contextStore.navigateBack(),
            visible: true,
          },
          {
            id: 'context-divider-1',
            type: 'divider',
          }
        );

        // Show other partners in same organization
        const partnersInSameOrg = this.contextStore.partnersInCurrentOrg();
        const otherPartners = partnersInSameOrg.filter(
          (partner: PartnerContext) => partner.partnerId !== (currentContext as any).partnerId
        );
        if (otherPartners.length > 0) {
          items.push({
            id: 'switch-partner-header',
            type: 'header',
            label: 'Switch Partner',
          });
          otherPartners.forEach((partner: PartnerContext) => {
            items.push({
              id: `context-partner-${partner.partnerId}`,
              type: 'action',
              label: partner.name,
              icon: '🤝',
              action: () => this.contextStore.switchContext(partner),
              visible: true,
            });
          });
        }
        break;

      default:
        // Fallback: Show basic context switcher
        items.push({
          id: 'context-header',
          type: 'header',
          label: 'Switch Context',
        });
        break;
    }

    return {
      id: 'context-switcher',
      title: 'Context',
      items,
      visible: true,
    };
  }

  /**
   * Build user menu (personal workspace)
   */
  private buildUserMenu(): MenuSection {
    return {
      id: 'user-menu',
      title: 'Personal',
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
          id: 'my-workspace',
          type: 'link',
          label: 'My Workspace',
          icon: '📂',
          route: '/workspace/my',
          visible: true,
        },
        {
          id: 'my-tasks',
          type: 'link',
          label: 'My Tasks',
          icon: '✓',
          route: '/tasks',
          visible: true,
        },
        {
          id: 'my-documents',
          type: 'link',
          label: 'My Documents',
          icon: '📄',
          route: '/documents',
          visible: true,
        },
      ],
      visible: true,
    };
  }

  /**
   * Build organization menu
   */
  private buildOrganizationMenu(context: any): MenuSection {
    return {
      id: 'organization-menu',
      title: context.name,
      items: [
        {
          id: 'org-dashboard',
          type: 'link',
          label: 'Organization Dashboard',
          icon: '🏢',
          route: `/organization/${context.organizationId}`,
          visible: true,
        },
        {
          id: 'org-teams',
          type: 'link',
          label: 'Teams',
          icon: '👥',
          route: `/organization/${context.organizationId}/teams`,
          visible: true,
        },
        {
          id: 'org-partners',
          type: 'link',
          label: 'Partners',
          icon: '🤝',
          route: `/organization/${context.organizationId}/partners`,
          visible: context.role === 'owner' || context.role === 'admin',
        },
      ],
      visible: true,
    };
  }

  /**
   * Build team menu
   */
  private buildTeamMenu(context: any): MenuSection {
    return {
      id: 'team-menu',
      title: context.name,
      items: [
        {
          id: 'team-dashboard',
          type: 'link',
          label: 'Team Dashboard',
          icon: '👥',
          route: `/team/${context.teamId}`,
          visible: true,
        },
        {
          id: 'team-members',
          type: 'link',
          label: 'Team Members',
          icon: '👤',
          route: `/team/${context.teamId}/members`,
          visible: true,
        },
      ],
      visible: true,
    };
  }

  /**
   * Build partner menu
   */
  private buildPartnerMenu(context: any): MenuSection {
    return {
      id: 'partner-menu',
      title: context.name,
      items: [
        {
          id: 'partner-dashboard',
          type: 'link',
          label: 'Partner Dashboard',
          icon: '🤝',
          route: `/partner/${context.partnerId}`,
          visible: true,
        },
        {
          id: 'partner-integration',
          type: 'link',
          label: 'Integration',
          icon: '🔗',
          route: `/partner/${context.partnerId}/integration`,
          visible: context.accessLevel === 'full',
        },
      ],
      visible: true,
    };
  }

  /**
   * Build workspace modules section
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
          id: 'fallback-user',
          title: user?.email || 'Account',
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
              route: '/workspace/my',
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
