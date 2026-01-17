import { Component, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore, AuthStoreInstance } from './core/auth/stores/auth.store';
import { ConfigStore } from './core/global-shell/stores/config.store';
import { LayoutStore } from './core/global-shell/stores/layout.store';
import { RouterStore } from './core/global-shell/stores/router.store';
import { WorkspaceListStore } from './core/workspace-list/stores/workspace-list.store';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './shared/components/layouts/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  template: `
    <div class="app-root" [attr.data-theme]="layoutStore.theme()">
      @if (configStore.isMaintenanceMode()) {
        <div class="maintenance-banner">
          ⚠️ {{ configStore.remoteConfig()?.maintenanceMessage || 'System under maintenance' }}
        </div>
      }
      <app-header></app-header>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-root {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 100vh;
      background: var(--app-bg, #f5f5f5);
      color: var(--app-text, #333);
    }

    .app-root[data-theme="dark"] {
      --app-bg: #1a1a1a;
      --app-text: #e5e5e5;
    }

    .app-root[data-theme="light"] {
      --app-bg: #f5f5f5;
      --app-text: #333;
    }

    .maintenance-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #fef3c7;
      color: #92400e;
      padding: 1rem;
      text-align: center;
      font-weight: 600;
      z-index: 10000;
      border-bottom: 2px solid #f59e0b;
    }
  `],
})
export class AppComponent {
  // GlobalShell stores - these manage app-wide state
  private authStore = inject<AuthStoreInstance>(AuthStore);
  protected configStore = inject(ConfigStore);
  protected layoutStore = inject(LayoutStore);
  private routerStore = inject(RouterStore);
  private workspaceListStore = inject(WorkspaceListStore);

  constructor() {
    // Initialize GlobalShell
    // Auth state sync is handled by AuthStore's withHooks onInit
    // RouterStore automatically starts tracking navigation
    // LayoutStore restores user preferences from localStorage
    
    // Load remote configuration
    this.configStore.loadRemoteConfig();

    // Auto-load workspace list when user authenticates
    // Critical: Only trigger after auth initialization completes
    effect(() => {
      // Wait for initialization to complete before loading workspaces
      if (!this.authStore.isInitializing() && this.authStore.isAuthenticated()) {
        this.workspaceListStore.loadWorkspaces();
      }
    });

    // Log navigation for debugging (can be removed in production)
    if (!this.configStore.environment() || this.configStore.environment() === 'development') {
      effect(() => {
        const currentRoute = this.routerStore.currentPath();
        if (currentRoute) {
          console.log('[Router]', currentRoute, this.routerStore.queryParams());
        }
      });
    }
  }
}
