import { Component, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore, ContextStoreInstance } from '../../../../core/context/stores/context.store';

@Component({
  selector: 'app-context-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="context-switcher">
      @if (hasOrganizations() || currentContextType() !== 'user') {
        <!-- Back Button (if not in Personal) -->
        @if (currentContextType() !== 'user') {
          <button class="context-back-btn" (click)="handleNavigateBack()" 
            [title]="currentContextType() === 'organization' ? 'Back to Personal' : 'Back to Organization'">
            <span>◀</span>
          </button>
        }
        
        <!-- Context Switcher Button -->
        <button class="context-btn" (click)="toggleDropdown()">
          <span class="context-icon">{{ contextIcon() }}</span>
          <span>{{ currentContextName() || 'Personal' }}</span>
          <span class="dropdown-icon">▼</span>
        </button>
        
        <!-- Unified Dropdown Menu -->
        @if (dropdownOpen()) {
          <div class="context-dropdown" (click)="$event.stopPropagation()">
            <!-- Organizations Section -->
            @if (availableContexts().organizations.length > 0) {
              <div class="context-section">
                <div class="section-title">Switch to Organization</div>
                @for (org of availableContexts().organizations; track org.organizationId) {
                  <button 
                    class="context-item"
                    [class.active]="currentContextType() === 'organization' && currentContextId() === org.organizationId"
                    (click)="handleSwitchContext(org)">
                    <span class="context-icon">🏢</span>
                    <span>{{ org.name }}</span>
                  </button>
                }
              </div>
            }
            
            <!-- Teams Section -->
            @if (availableContexts().teams.length > 0) {
              <div class="context-section">
                <div class="section-title">Switch to Team</div>
                @for (team of availableContexts().teams; track team.teamId) {
                  <button 
                    class="context-item"
                    [class.active]="currentContextType() === 'team' && currentContextId() === team.teamId"
                    (click)="handleSwitchContext(team)">
                    <span class="context-icon">👥</span>
                    <span>{{ team.name }}</span>
                  </button>
                }
              </div>
            }
            
            <!-- Partners Section -->
            @if (availableContexts().partners.length > 0) {
              <div class="context-section">
                <div class="section-title">Switch to Partner</div>
                @for (partner of availableContexts().partners; track partner.partnerId) {
                  <button 
                    class="context-item"
                    [class.active]="currentContextType() === 'partner' && currentContextId() === partner.partnerId"
                    (click)="handleSwitchContext(partner)">
                    <span class="context-icon">🤝</span>
                    <span>{{ partner.name }}</span>
                  </button>
                }
              </div>
            }
          </div>
        }
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

    .context-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
    }

    .context-icon {
      font-size: 16px;
    }

    .dropdown-icon {
      font-size: 10px;
    }

    .context-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      min-width: 250px;
      max-height: 400px;
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
      gap: 12px;
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
  `],
})
export class ContextSwitcherComponent {
  private contextStore = inject<ContextStoreInstance>(ContextStore);
  
  // Local UI state
  protected dropdownOpen = signal(false);
  
  // Computed signals wrapping store access
  protected hasOrganizations = computed(() => this.contextStore.hasOrganizations());
  protected currentContextType = computed(() => this.contextStore.currentContextType());
  protected currentContextName = computed(() => this.contextStore.currentContextName());
  protected currentContextId = computed(() => this.contextStore.currentContextId());
  protected availableContexts = computed(() => this.contextStore.available());
  protected contextIcon = computed(() => this.getContextIconForType(this.currentContextType()));
  
  // Output events
  contextSwitch = output<any>();
  navigateBack = output<void>();

  constructor() {
    // Close dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;
        const isContextArea = target?.closest('.context-switcher');
        
        if (this.dropdownOpen() && !isContextArea) {
          this.dropdownOpen.set(false);
        }
      });
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  handleSwitchContext(context: any): void {
    this.contextStore.switchContext(context);
    this.dropdownOpen.set(false);
    this.contextSwitch.emit(context);
  }

  handleNavigateBack(): void {
    const currentType = this.currentContextType();
    
    if (currentType === 'team' || currentType === 'partner') {
      this.contextStore.navigateBack();
    } else if (currentType === 'organization') {
      this.contextStore.resetContext();
    }
    
    this.dropdownOpen.set(false);
    this.navigateBack.emit();
  }

  private getContextIconForType(type: string | null): string {
    switch (type) {
      case 'organization':
        return '🏢';
      case 'team':
        return '👥';
      case 'partner':
        return '🤝';
      case 'user':
        return '👤';
      default:
        return '👤';
    }
  }
}
