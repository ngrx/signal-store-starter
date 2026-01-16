import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore, AuthStoreInstance } from '../../../core/auth/stores/auth.store';
import { ContextStore, ContextStoreInstance } from '../../../core/context/stores/context.store';
import { MenuItem } from '../../models/menu.model';
import { UserAvatarComponent } from '../../components/widgets/user-avatar/user-avatar.component';
import { OrganizationAvatarComponent } from '../../components/widgets/user-avatar/organization-avatar.component';
import { TeamAvatarComponent } from '../../components/widgets/user-avatar/team-avatar.component';
import { PartnerAvatarComponent } from '../../components/widgets/user-avatar/partner-avatar.component';
import { ContextSwitcherComponent } from '../../components/widgets/context-switcher/context-switcher.component';
import { WorkspaceSwitcherComponent } from '../../components/widgets/workspace-switcher/workspace-switcher.component';
import { ThemeToggleComponent } from '../../components/widgets/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    UserAvatarComponent,
    OrganizationAvatarComponent,
    TeamAvatarComponent,
    PartnerAvatarComponent,
    ContextSwitcherComponent,
    WorkspaceSwitcherComponent,
    ThemeToggleComponent,
  ],
  template: `
    <header class="header">
      <div class="header-content">
        <!-- App Logo -->
        <div class="logo">
          <span class="logo-icon">🔥</span>
          <span class="logo-text">Signal Store App</span>
        </div>

        <!-- Navigation Controls -->
        @if (authStore.isAuthenticated()) {
          <nav class="nav">
            <app-context-switcher 
              (contextSwitch)="onContextSwitch()"
              (navigateBack)="onNavigateBack()" />
            
            <app-workspace-switcher 
              (workspaceSelect)="onWorkspaceSelect($event)" />
            
            <app-theme-toggle />
            
            <!-- Context-Aware Avatar -->
            @switch (contextStore.currentContextType()) {
              @case ('organization') {
                <app-organization-avatar (menuItemClick)="onMenuItemClick($event)" />
              }
              @case ('team') {
                <app-team-avatar (menuItemClick)="onMenuItemClick($event)" />
              }
              @case ('partner') {
                <app-partner-avatar (menuItemClick)="onMenuItemClick($event)" />
              }
              @default {
                <app-user-avatar (menuItemClick)="onMenuItemClick($event)" />
              }
            }
          </nav>
        }
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      width: 100%;
      backdrop-filter: blur(10px);
      background-color: rgba(255, 255, 255, 0.98);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 64px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }

    .logo-icon {
      font-size: 24px;
    }

    .nav {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    @media (max-width: 768px) {
      .nav {
        gap: 4px;
      }
    }
  `],
})
export class HeaderComponent {
  protected authStore = inject<AuthStoreInstance>(AuthStore);
  protected contextStore = inject<ContextStoreInstance>(ContextStore);
  private router = inject(Router);

  onContextSwitch(): void {
    // Navigate to workspace list in new context
    this.router.navigate(['/workspace']);
  }

  onNavigateBack(): void {
    // Navigate to workspace list in parent context
    this.router.navigate(['/workspace']);
  }

  onWorkspaceSelect(workspaceId: string): void {
    // Navigate to the workspace overview
    this.router.navigate(['/workspace', workspaceId, 'overview']);
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.disabled) return;

    if (item.route) {
      this.router.navigate([item.route]);
    } else if (item.action) {
      const result = item.action();
      if (item.id === 'logout') {
        Promise.resolve(result).finally(() => this.router.navigate(['/login']));
      }
    }
  }
}
