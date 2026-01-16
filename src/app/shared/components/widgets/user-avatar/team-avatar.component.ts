import { Component, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore, AuthStoreInstance } from '../../../../core/auth/stores/auth.store';
import { ContextStore, ContextStoreInstance } from '../../../../core/context/stores/context.store';
import { AvatarService } from '../../../services/avatar.service';
import { MenuService } from '../../../services/menu.service';
import { MenuItem } from '../../../models/menu.model';

@Component({
  selector: 'app-team-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-section">
      <div class="avatar-container" (click)="toggleMenu()">
        <div class="avatar-icon-team">
          <span class="team-icon">👥</span>
        </div>
        <span class="context-name">{{ teamName() }}</span>
        <span class="dropdown-icon">▼</span>
      </div>

      @if (menuOpen()) {
        <div class="dropdown-menu" (click)="$event.stopPropagation()">
          <div class="menu-header">
            <div class="menu-team-icon">👥</div>
            <div class="menu-user-info">
              <div class="menu-email">{{ teamName() }}</div>
              <div class="menu-status">Team Context</div>
            </div>
          </div>

          @for (section of teamMenu().sections; track section.id) {
            @if (section.visible !== false) {
              <div class="menu-section">
                @if (section.title) {
                  <div class="menu-section-title">{{ section.title }}</div>
                }
                @for (item of section.items; track item.id) {
                  @if (item.visible !== false) {
                    @if (item.type === 'divider') {
                      <div class="menu-divider"></div>
                    } @else {
                      <button 
                        class="menu-item"
                        (click)="handleMenuItem(item)"
                      >
                        @if (item.icon) {
                          <span class="menu-icon">{{ item.icon }}</span>
                        }
                        <span class="menu-label">{{ item.label }}</span>
                      </button>
                    }
                  }
                }
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .user-section {
      position: relative;
    }

    .avatar-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 12px 4px 4px;
      border-radius: 24px;
      transition: background-color 0.2s;
    }

    .avatar-container:hover {
      background-color: #f5f5f5;
    }

    .avatar-icon-team {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    }

    .team-icon {
      font-size: 20px;
    }

    .context-name {
      font-size: 14px;
      color: #333;
      font-weight: 600;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-icon {
      font-size: 10px;
      color: #666;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      min-width: 280px;
      overflow: hidden;
      z-index: 1000;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      color: white;
    }

    .menu-team-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      font-size: 24px;
      flex-shrink: 0;
    }

    .menu-user-info {
      flex: 1;
    }

    .menu-email {
      font-weight: 600;
      margin-bottom: 4px;
      word-break: break-word;
    }

    .menu-status {
      font-size: 12px;
      opacity: 0.9;
    }

    .menu-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 8px 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px 16px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      transition: background-color 0.2s;
    }

    .menu-item:hover {
      background-color: #f5f5f5;
    }

    .menu-icon {
      font-size: 18px;
      flex-shrink: 0;
    }

    .menu-label {
      flex: 1;
    }

    .menu-badge {
      background: #48bb78;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .menu-section {
      padding: 4px 0;
    }

    .menu-section-title {
      padding: 8px 16px 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.5px;
    }

    .menu-header-item {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #666;
    }

    .menu-item.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .menu-item.disabled:hover {
      background-color: transparent;
    }

    @media (max-width: 768px) {
      .context-name {
        display: none;
      }
    }
  `],
})
export class TeamAvatarComponent {
  protected authStore = inject<AuthStoreInstance>(AuthStore);
  protected contextStore = inject<ContextStoreInstance>(ContextStore);
  private avatarService = inject(AvatarService);
  private menuService = inject(MenuService);
  
  protected menuOpen = signal(false);
  
  // Computed signals
  protected teamName = computed(() => {
    return this.contextStore.currentContextName() || 'Team';
  });

  protected teamMenu = computed(() => {
    // Build team-specific menu
    return {
      sections: [
        {
          id: 'team-actions',
          title: undefined,
          visible: true,
          items: [
            {
              id: 'team-settings',
              type: 'link' as const,
              label: 'Team Settings',
              icon: '⚙️',
              route: '/team/settings',
              visible: true,
            },
            {
              id: 'team-members',
              type: 'link' as const,
              label: 'Team Members',
              icon: '👥',
              route: '/team/members',
              visible: true,
            },
            {
              id: 'team-projects',
              type: 'link' as const,
              label: 'Projects',
              icon: '📁',
              route: '/team/projects',
              visible: true,
            },
          ],
        },
        {
          id: 'user-actions',
          title: undefined,
          visible: true,
          items: [
            { id: 'divider', type: 'divider' as const, visible: true },
            {
              id: 'profile',
              type: 'link' as const,
              label: 'Profile',
              icon: '👤',
              route: '/profile',
              visible: true,
            },
            {
              id: 'logout',
              type: 'action' as const,
              label: 'Logout',
              icon: '🚪',
              action: () => this.authStore.logout(),
              visible: true,
            },
          ],
        },
      ],
    };
  });
  
  // Output event for menu item clicks
  menuItemClick = output<MenuItem>();

  constructor() {
    // Close menu when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;
        const isUserArea = target?.closest('.user-section');
        
        if (this.menuOpen() && !isUserArea) {
          this.menuOpen.set(false);
        }
      });
    }
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  handleMenuItem(item: MenuItem): void {
    if (item.disabled) return;
    this.menuOpen.set(false);
    this.menuItemClick.emit(item);
  }
}
