import { Component, DestroyRef, inject, computed, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore, ContextStoreInstance } from '../../../../core/context/stores/context.store';
import type { AppContext } from '../../../../core/context/models/context.model';
import { AuthStore, AuthStoreInstance } from '../../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-context-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="context-switcher">
      <!-- Back Button (if not in Personal) -->
      @if (currentContextType() !== 'user') {
        <button class="context-back-btn" (click)="handleNavigateBack()" 
          [title]="currentContextType() === 'organization' ? 'Back to Personal' : 'Back to Organization'">
          <span>◀</span>
        </button>
      }
      
      <!-- Context Switcher Button -->
      <button
        class="context-btn"
        type="button"
        (click)="toggleDropdown()"
        [attr.aria-expanded]="dropdownOpen()"
        aria-haspopup="menu"
        [attr.aria-controls]="dropdownId">
        <span class="context-icon">{{ contextIcon() }}</span>
        <span>{{ currentDisplayName() }}</span>
        <span class="dropdown-icon">▼</span>
      </button>

      @if (dropdownOpen()) {
        <div class="context-dropdown" [id]="dropdownId" role="menu" (click)="$event.stopPropagation()">
          <div class="context-section">
            <div class="section-title">Personal</div>
            <button
              class="context-item"
              type="button"
              role="menuitem"
              [class.active]="currentContextType() === 'user'"
              (click)="handleSwitchToPersonal()">
              <span class="context-icon">👤</span>
              <span class="context-name">Personal</span>
              @if (userEmail()) {
                <span class="context-meta">{{ userEmail() }}</span>
              }
            </button>
          </div>

          <div class="context-section">
            <div class="section-title">Organizations</div>
            @if (organizationContexts().length > 0) {
              @for (org of organizationContexts(); track org.organizationId) {
                <button
                  class="context-item"
                  type="button"
                  role="menuitem"
                  [class.active]="isCurrentContext(org)"
                  (click)="handleSwitchContext(org)">
                  <span class="context-icon">🏢</span>
                  <span class="context-name">{{ org.name }}</span>
                  <span class="context-meta">{{ org.role }}</span>
                </button>
              }
            } @else {
              <div class="context-empty">No organizations yet</div>
            }
          </div>

          <div class="context-section">
            <div class="section-title">Teams</div>
            @if (teamContexts().length > 0) {
              @for (team of teamContexts(); track team.teamId) {
                <button
                  class="context-item"
                  type="button"
                  role="menuitem"
                  [class.active]="isCurrentContext(team)"
                  (click)="handleSwitchContext(team)">
                  <span class="context-icon">👥</span>
                  <span class="context-name">{{ team.name }}</span>
                  <span class="context-meta">{{ team.role }}</span>
                </button>
              }
            } @else {
              <div class="context-empty">No teams yet</div>
            }
          </div>

          <div class="context-section">
            <div class="section-title">Partners</div>
            @if (partnerContexts().length > 0) {
              @for (partner of partnerContexts(); track partner.partnerId) {
                <button
                  class="context-item"
                  type="button"
                  role="menuitem"
                  [class.active]="isCurrentContext(partner)"
                  (click)="handleSwitchContext(partner)">
                  <span class="context-icon">🤝</span>
                  <span class="context-name">{{ partner.name }}</span>
                  <span class="context-meta">{{ partner.accessLevel }}</span>
                </button>
              }
            } @else {
              <div class="context-empty">No partners yet</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .context-switcher {
      position: relative;
      margin-right: 1rem;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .context-back-btn {
      padding: 8px 10px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: #666;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .context-back-btn:hover {
      border-color: #667eea;
      background: #f8f9ff;
      color: #667eea;
    }

    .context-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      font-weight: 500;
    }

    .context-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }

    .context-icon {
      font-size: 16px;
    }

    .dropdown-icon {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.9);
    }

    .context-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      min-width: 260px;
      max-height: 420px;
      overflow-y: auto;
      z-index: 1000;
    }

    .context-section {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .context-section:last-child {
      border-bottom: none;
    }

    .section-title {
      padding: 8px 16px 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 0.5px;
    }

    .context-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 16px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      color: #333;
      transition: background-color 0.2s;
    }

    .context-item:hover {
      background-color: #f5f5f5;
    }

    .context-item.active {
      background-color: #f8f9ff;
      color: #667eea;
      font-weight: 600;
    }

    .context-name {
      flex: 1;
    }

    .context-meta {
      font-size: 12px;
      color: #666;
      text-transform: capitalize;
    }

    .context-empty {
      padding: 8px 16px 12px;
      font-size: 12px;
      color: #999;
    }
  `],
})
export class ContextSwitcherComponent {
  private contextStore = inject<ContextStoreInstance>(ContextStore);
  private authStore = inject<AuthStoreInstance>(AuthStore);
  private destroyRef = inject(DestroyRef);
  protected dropdownOpen = signal(false);
  protected dropdownId = 'context-switcher-menu';

  contextSwitch = output<AppContext>();
  navigateBack = output<void>();
  
  // Core computed signals
  protected currentContext = computed(() => this.contextStore.current());
  protected availableContexts = computed(() => this.contextStore.available());
  protected currentContextType = computed(() => this.contextStore.currentContextType());
  protected currentContextName = computed(() => this.contextStore.currentContextName());
  protected userEmail = computed(() => this.authStore.user()?.email || '');
  protected organizationContexts = computed(() => this.availableContexts().organizations);
  protected teamContexts = computed(() => this.availableContexts().teams);
  protected partnerContexts = computed(() => this.availableContexts().partners);
  
  // Display name for current context
  protected currentDisplayName = computed(() => {
    return this.currentContextName() || 'Personal';
  });
  
  // Context icon
  protected contextIcon = computed(() => {
    const type = this.currentContextType();
    switch (type) {
      case 'organization': return '🏢';
      case 'team': return '👥';
      case 'partner': return '🤝';
      case 'user':
      default: return '👤';
    }
  });
  
  constructor() {
    if (typeof document !== 'undefined') {
      const onDocumentClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const isContextArea = target?.closest('.context-switcher');
        if (this.dropdownOpen() && !isContextArea) {
          this.dropdownOpen.set(false);
        }
      };
      document.addEventListener('click', onDocumentClick);
      this.destroyRef.onDestroy(() => {
        document.removeEventListener('click', onDocumentClick);
      });
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  handleSwitchToPersonal(): void {
    const user = this.authStore.user();
    if (!user) {
      this.dropdownOpen.set(false);
      return;
    }
    const personalContext: AppContext = {
      type: 'user',
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName ?? null,
    };
    this.contextStore.resetContext();
    this.dropdownOpen.set(false);
    this.contextSwitch.emit(personalContext);
  }

  handleSwitchContext(context: AppContext): void {
    this.contextStore.switchContext(context);
    this.dropdownOpen.set(false);
    this.contextSwitch.emit(context);
  }

  isCurrentContext(context: AppContext): boolean {
    const current = this.currentContext();
    if (!current) return false;
    if (context.type !== current.type) return false;
    switch (context.type) {
      case 'organization':
        return context.organizationId === (current as typeof context).organizationId;
      case 'team':
        return context.teamId === (current as typeof context).teamId;
      case 'partner':
        return context.partnerId === (current as typeof context).partnerId;
      case 'user':
      default:
        return true;
    }
  }

  handleNavigateBack(): void {
    const currentType = this.currentContextType();
    console.log('[ContextSwitcher] Navigate back from', currentType);
    this.dropdownOpen.set(false);
    
    const beforeType = this.contextStore.currentContextType();
    const beforeId = this.contextStore.currentContextId();
    this.contextStore.navigateBack();
    const afterType = this.contextStore.currentContextType();
    const afterId = this.contextStore.currentContextId();
    if (beforeType !== afterType || beforeId !== afterId) {
      this.navigateBack.emit();
    }
  }
}
