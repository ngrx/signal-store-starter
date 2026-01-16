import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceListStore, WorkspaceListStoreInstance } from '../../../core/workspace-list/stores/workspace-list.store';
import { WorkspaceListItem } from '../../../core/workspace-list/models/workspace-list.model';

type WorkspaceTypeFilter = 'all' | 'project' | 'department' | 'client' | 'campaign' | 'product' | 'internal';

interface TypeFilterTab {
  type: WorkspaceTypeFilter;
  label: string;
  icon: string;
  count: () => number;
}

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="wrapper">
      <header>
        <h1>My Workspaces</h1>
        <p>Filter by type to find projects, departments, clients, and more.</p>
      </header>

      <!-- Type Filter Tabs -->
      <nav class="type-filters">
        @for (tab of typeFilterTabs; track tab.type) {
          <button 
            class="filter-tab"
            [class.active]="selectedTypeFilter() === tab.type"
            (click)="selectedTypeFilter.set(tab.type)"
            type="button">
            <span class="icon">{{ tab.icon }}</span>
            <span class="label">{{ tab.label }}</span>
            <span class="count">({{ tab.count() }})</span>
          </button>
        }
      </nav>

      @if (filteredWorkspaces().length === 0) {
        <div class="empty">
          @if (selectedTypeFilter() === 'all') {
            No workspaces available yet.
          } @else {
            No {{ selectedTypeFilter() }} workspaces found.
          }
        </div>
      } @else {
        <div class="workspace-grid">
          @for (workspace of filteredWorkspaces(); track workspace.id) {
            <article class="workspace-card">
              <div class="card-header">
                <div class="header-top">
                  <span class="type-icon">{{ getTypeIcon(workspace.type) }}</span>
                  <span class="status-badge" [class]="workspace.status || 'active'">
                    {{ workspace.status || 'active' }}
                  </span>
                </div>
                <h3>{{ workspace.name }}</h3>
              </div>
              <p class="description">{{ workspace.description || 'No description provided' }}</p>
              <div class="card-meta">
                <span class="meta-item">
                  👥 {{ getMemberCount(workspace) }} members
                </span>
                <span class="meta-item">
                  📅 {{ getLastActivity(workspace) }}
                </span>
              </div>
              <div class="card-actions">
                <a [routerLink]="['/workspace', workspace.id, 'overview']" class="primary-action">
                  Open Workspace
                </a>
                <button 
                  (click)="toggleFavorite(workspace.id)" 
                  class="secondary-action"
                  [class.favorited]="workspace.isFavorite"
                  type="button"
                  [attr.aria-label]="workspace.isFavorite ? 'Remove from favorites' : 'Add to favorites'">
                  {{ workspace.isFavorite ? '★' : '☆' }}
                </button>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .wrapper {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    header h1 {
      margin: 0;
      font-size: 28px;
      color: #111827;
    }

    header p {
      margin: 4px 0 0;
      color: #6b7280;
      font-size: 14px;
    }

    /* Type Filter Tabs */
    .type-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 12px;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
    }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1px solid transparent;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #374151;
      transition: all 0.2s;
    }

    .filter-tab:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    .filter-tab.active {
      background: #4f46e5;
      color: white;
      border-color: #4f46e5;
      font-weight: 600;
    }

    .filter-tab .icon {
      font-size: 16px;
    }

    .filter-tab .count {
      font-size: 12px;
      opacity: 0.8;
    }

    /* Workspace Grid */
    .workspace-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      padding: 8px 0;
    }

    @media (max-width: 768px) {
      .workspace-grid {
        grid-template-columns: 1fr;
      }
    }

    .workspace-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s, box-shadow 0.2s;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .workspace-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .type-icon {
      font-size: 24px;
      line-height: 1;
    }

    .status-badge {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }

    .status-badge.archived {
      background: #e5e7eb;
      color: #4b5563;
    }

    .status-badge.suspended {
      background: #fee2e2;
      color: #991b1b;
    }

    .card-header h3 {
      margin: 0;
      font-size: 18px;
      color: #111827;
      font-weight: 600;
    }

    .description {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .meta-item {
      font-size: 13px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      margin-top: auto;
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .primary-action {
      flex: 1;
      padding: 10px 16px;
      background: #4f46e5;
      color: white;
      border-radius: 8px;
      text-decoration: none;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }

    .primary-action:hover {
      background: #4338ca;
    }

    .secondary-action {
      padding: 10px 14px;
      background: #f3f4f6;
      color: #6b7280;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .secondary-action:hover {
      background: #e5e7eb;
    }

    .secondary-action.favorited {
      color: #f59e0b;
    }

    .empty {
      padding: 48px 24px;
      background: #f9fafb;
      border: 2px dashed #d1d5db;
      border-radius: 12px;
      text-align: center;
      color: #6b7280;
      font-size: 15px;
    }
  `],
})
export class MyWorkspaceComponent {
  private workspaceListStore = inject<WorkspaceListStoreInstance>(WorkspaceListStore);
  
  protected selectedTypeFilter = signal<WorkspaceTypeFilter>('all');

  protected typeFilterTabs: TypeFilterTab[] = [
    {
      type: 'all',
      label: 'All',
      icon: '📋',
      count: () => this.workspaceListStore.workspaces().length,
    },
    {
      type: 'project',
      label: 'Projects',
      icon: '📁',
      count: () => this.workspaceListStore.projectWorkspaces().length,
    },
    {
      type: 'department',
      label: 'Departments',
      icon: '🏢',
      count: () => this.workspaceListStore.departmentWorkspaces().length,
    },
    {
      type: 'client',
      label: 'Clients',
      icon: '🤝',
      count: () => this.workspaceListStore.clientWorkspaces().length,
    },
    {
      type: 'campaign',
      label: 'Campaigns',
      icon: '📢',
      count: () => this.workspaceListStore.campaignWorkspaces().length,
    },
    {
      type: 'product',
      label: 'Products',
      icon: '📦',
      count: () => this.workspaceListStore.productWorkspaces().length,
    },
    {
      type: 'internal',
      label: 'Internal',
      icon: '⚙️',
      count: () => this.workspaceListStore.internalWorkspaces().length,
    },
  ];

  protected filteredWorkspaces = computed(() => {
    const filter = this.selectedTypeFilter();
    switch (filter) {
      case 'all':
        return this.workspaceListStore.workspaces();
      case 'project':
        return this.workspaceListStore.projectWorkspaces();
      case 'department':
        return this.workspaceListStore.departmentWorkspaces();
      case 'client':
        return this.workspaceListStore.clientWorkspaces();
      case 'campaign':
        return this.workspaceListStore.campaignWorkspaces();
      case 'product':
        return this.workspaceListStore.productWorkspaces();
      case 'internal':
        return this.workspaceListStore.internalWorkspaces();
      default:
        return this.workspaceListStore.workspaces();
    }
  });

  protected getTypeIcon(type?: string): string {
    switch (type) {
      case 'project':
        return '📁';
      case 'department':
        return '🏢';
      case 'client':
        return '🤝';
      case 'campaign':
        return '📢';
      case 'product':
        return '📦';
      case 'internal':
        return '⚙️';
      default:
        return '📋';
    }
  }

  protected getMemberCount(workspace: WorkspaceListItem): number {
    return workspace.resourceCount?.members || 0;
  }

  protected getLastActivity(workspace: WorkspaceListItem): string {
    const lastAccessed = workspace.lastAccessedAt;
    if (!lastAccessed) return 'Never accessed';
    
    const now = new Date();
    const diff = now.getTime() - lastAccessed.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }

  protected toggleFavorite(workspaceId: string): void {
    const workspace = this.workspaceListStore.workspaceById()[workspaceId];
    if (workspace) {
      this.workspaceListStore.toggleFavorite({ 
        workspaceId, 
        isFavorite: !workspace.isFavorite 
      });
    }
  }
}
