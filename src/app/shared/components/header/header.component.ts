import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">🔥</span>
          <span class="logo-text">Signal Store App</span>
        </div>

        <nav class="nav">
          <button class="nav-link" (click)="navigateTo('/dashboard')">Dashboard</button>
          <button class="nav-link" (click)="navigateTo('/projects')">Projects</button>
          <button class="nav-link" (click)="navigateTo('/team')">Team</button>
        </nav>

        <div class="user-section">
          <div class="avatar-container" (click)="toggleMenu()">
            <div class="avatar">
              {{ getInitials() }}
            </div>
            <span class="user-email-short">{{ getShortEmail() }}</span>
            <span class="dropdown-icon">▼</span>
          </div>

          @if (menuOpen()) {
            <div class="dropdown-menu" (click)="$event.stopPropagation()">
              <div class="menu-header">
                <div class="menu-avatar">{{ getInitials() }}</div>
                <div class="menu-user-info">
                  <div class="menu-email">{{ authStore.user()?.email }}</div>
                  <div class="menu-status">Authenticated</div>
                </div>
              </div>
              <div class="menu-divider"></div>
              <button class="menu-item" (click)="navigateTo('/profile')">
                <span class="menu-icon">👤</span>
                Profile
              </button>
              <button class="menu-item" (click)="navigateTo('/settings')">
                <span class="menu-icon">⚙️</span>
                Settings
              </button>
              <div class="menu-divider"></div>
              <button class="menu-item logout" (click)="logout()">
                <span class="menu-icon">🚪</span>
                Logout
              </button>
            </div>
          }
        </div>
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
    }

    .nav-link {
      padding: 8px 16px;
      background: none;
      border: none;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border-radius: 6px;
      transition: background-color 0.2s, color 0.2s;
    }

    .nav-link:hover {
      background-color: #f5f5f5;
      color: #333;
    }

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

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .user-email-short {
      font-size: 14px;
      color: #333;
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
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .menu-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 18px;
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

    .menu-item.logout {
      color: #e53e3e;
    }

    .menu-item.logout:hover {
      background-color: #fee;
    }

    .menu-icon {
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .nav {
        display: none;
      }

      .user-email-short {
        display: none;
      }
    }
  `],
})
export class HeaderComponent {
  protected authStore = inject(AuthStore);
  private router = inject(Router);
  protected menuOpen = signal(false);

  constructor() {
    // Close menu when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', () => {
        if (this.menuOpen()) {
          this.menuOpen.set(false);
        }
      });
    }
  }

  toggleMenu(): void {
    this.menuOpen.set(!this.menuOpen());
  }

  getInitials(): string {
    const email = this.authStore.user()?.email || '';
    return email.charAt(0).toUpperCase();
  }

  getShortEmail(): string {
    const email = this.authStore.user()?.email || '';
    const maxLength = 20;
    return email.length > maxLength ? email.substring(0, maxLength) + '...' : email;
  }

  navigateTo(path: string): void {
    this.menuOpen.set(false);
    this.router.navigate([path]);
  }

  logout(): void {
    this.authStore.logout().then(() => {
      this.menuOpen.set(false);
      this.router.navigate(['/login']);
    });
  }
}
