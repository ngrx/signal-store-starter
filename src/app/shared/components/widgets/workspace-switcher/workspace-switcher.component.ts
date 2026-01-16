import { Component, inject, signal, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore, AuthStoreInstance } from '../../../../core/auth/stores/auth.store';
import { WorkspaceListStore } from '../../../../core/workspace-list/stores/workspace-list.store';

@Component({
  selector: 'app-workspace-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isAuthenticated() && hasWorkspaces()) {
      <div class="workspace-switcher">
        <button class="workspace-btn" (click)="toggleDropdown()">
          <span>{{ currentWorkspace()?.name || 'Select Workspace' }}</span>
          <span class="dropdown-icon">▼</span>
        </button>
        
        @if (dropdownOpen()) {
          <div class="workspace-dropdown" (click)="$event.stopPropagation()">
            <div class="workspace-section">
              <div class="section-title">My Workspaces</div>
              @for (workspace of ownedWorkspaces(); track workspace.id) {
                <button 
                  class="workspace-item"
                  [class.active]="workspace.id === currentWorkspaceId()"
                  (click)="handleSelectWorkspace(workspace.id)">
                  <span>{{ workspace.name }}</span>
                  @if (workspace.isFavorite) {
                    <span class="favorite-icon">⭐</span>
                  }
                </button>
              }
            </div>
            
            @if (memberWorkspaces().length > 0) {
              <div class="workspace-section">
                <div class="section-title">Shared with me</div>
                @for (workspace of memberWorkspaces(); track workspace.id) {
                  <button 
                    class="workspace-item"
                    [class.active]="workspace.id === currentWorkspaceId()"
                    (click)="handleSelectWorkspace(workspace.id)">
                    <span>{{ workspace.name }}</span>
                  </button>
                }
              </div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .workspace-switcher {
      position: relative;
      margin-right: 1rem;
    }

    .workspace-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: #333;
    }

    .workspace-btn:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .dropdown-icon {
      font-size: 10px;
      color: #666;
    }

    .workspace-dropdown {
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

    .workspace-section {
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }

    .workspace-section:last-child {
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

    .workspace-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .workspace-item:hover {
      background-color: #f5f5f5;
    }

    .workspace-item.active {
      background-color: #f8f9ff;
      color: #667eea;
      font-weight: 600;
    }

    .favorite-icon {
      font-size: 12px;
    }

    @media (max-width: 768px) {
      .workspace-switcher {
        margin-right: 0.5rem;
      }

      .workspace-btn span:first-child {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  `],
})
export class WorkspaceSwitcherComponent {
  private authStore = inject<AuthStoreInstance>(AuthStore);
  private workspaceListStore = inject(WorkspaceListStore);
  
  // Local UI state
  protected dropdownOpen = signal(false);
  
  // Computed signals wrapping store access
  protected isAuthenticated = computed(() => this.authStore.isAuthenticated());
  protected hasWorkspaces = computed(() => this.workspaceListStore.hasWorkspaces());
  protected currentWorkspace = computed(() => this.workspaceListStore.currentWorkspace());
  protected ownedWorkspaces = computed(() => this.workspaceListStore.ownedWorkspaces());
  protected memberWorkspaces = computed(() => this.workspaceListStore.memberWorkspaces());
  protected currentWorkspaceId = computed(() => this.workspaceListStore.currentWorkspaceId());
  
  // Output event
  workspaceSelect = output<string>();

  constructor() {
    // Close dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement | null;
        const isWorkspaceArea = target?.closest('.workspace-switcher');
        
        if (this.dropdownOpen() && !isWorkspaceArea) {
          this.dropdownOpen.set(false);
        }
      });
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.set(!this.dropdownOpen());
  }

  handleSelectWorkspace(workspaceId: string): void {
    this.workspaceListStore.selectWorkspace(workspaceId);
    this.dropdownOpen.set(false);
    this.workspaceSelect.emit(workspaceId);
  }
}
