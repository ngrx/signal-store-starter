import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore, ContextStoreInstance } from '../../../core/context/stores/context.store';
import { OverviewStore } from '../../../core/workspace/stores/overview.store';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overview-container">
      <h1>📊 Workspace Overview</h1>
      
      <div class="context-info">
        <h2>Current Context</h2>
        <p><strong>Type:</strong> {{ contextStore.currentContextType() }}</p>
        <p><strong>Name:</strong> {{ contextStore.currentContextName() }}</p>
      </div>

      @if (overviewStore.isLoading()) {
        <div class="loading">Loading workspace data...</div>
      } @else if (overviewStore.currentOverview()) {
        <div class="stats-grid">
          <div class="stat-card">
            <h3>Health Status</h3>
            <div class="stat-value" [class.success]="overviewStore.healthStatus()?.overall === 'healthy'"
                 [class.warning]="overviewStore.healthStatus()?.overall === 'warning'"
                 [class.critical]="overviewStore.healthStatus()?.overall === 'critical'">
              {{ getHealthIcon() }} {{ getHealthLabel() }}
            </div>
            <p class="stat-label">System status</p>
            @if (getHealthIssuesCount() > 0) {
              <div class="health-issues">
                {{ getHealthIssuesCount() }} issue(s)
              </div>
            }
          </div>

          <div class="stat-card">
            <h3>Tasks</h3>
            <div class="stat-value">{{ overviewStore.dashboardMetrics()?.totalTasks || 0 }}</div>
            <p class="stat-label">
              {{ overviewStore.dashboardMetrics()?.completedTasks || 0 }} completed,
              {{ overviewStore.dashboardMetrics()?.inProgressTasks || 0 }} in progress
            </p>
          </div>

          <div class="stat-card">
            <h3>Documents</h3>
            <div class="stat-value">{{ overviewStore.dashboardMetrics()?.totalDocuments || 0 }}</div>
            <p class="stat-label">Total documents</p>
          </div>

          <div class="stat-card">
            <h3>Members</h3>
            <div class="stat-value">{{ overviewStore.dashboardMetrics()?.totalMembers || 1 }}</div>
            <p class="stat-label">Active users</p>
          </div>
        </div>

        <!-- Usage Stats -->
        <div class="usage-section">
          <h2>Resource Usage</h2>
          <div class="usage-grid">
            <div class="usage-card">
              <div class="usage-header">
                <span>Storage</span>
                <span class="usage-percent">{{ overviewStore.storageUsagePercent() | number:'1.0-1' }}%</span>
              </div>
              <div class="usage-bar">
                <div class="usage-fill" [style.width.%]="overviewStore.storageUsagePercent()"></div>
              </div>
              <p class="usage-detail">
                {{ formatBytes(overviewStore.usageStats()?.storageUsed || 0) }} / 
                {{ formatBytes(overviewStore.usageStats()?.storageQuota || 0) }}
              </p>
            </div>

            <div class="usage-card">
              <div class="usage-header">
                <span>API Calls</span>
                <span class="usage-percent">{{ overviewStore.apiCallsUsagePercent() | number:'1.0-1' }}%</span>
              </div>
              <div class="usage-bar">
                <div class="usage-fill" [style.width.%]="overviewStore.apiCallsUsagePercent()"></div>
              </div>
              <p class="usage-detail">
                {{ overviewStore.usageStats()?.apiCalls || 0 }} / 
                {{ overviewStore.usageStats()?.apiCallsQuota || 0 }}
              </p>
            </div>

            <div class="usage-card">
              <div class="usage-header">
                <span>Members</span>
                <span class="usage-percent">{{ overviewStore.membersUsagePercent() | number:'1.0-1' }}%</span>
              </div>
              <div class="usage-bar">
                <div class="usage-fill" [style.width.%]="overviewStore.membersUsagePercent()"></div>
              </div>
              <p class="usage-detail">
                {{ overviewStore.usageStats()?.membersCount || 0 }} / 
                {{ overviewStore.usageStats()?.membersQuota || 0 }}
              </p>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty-state">
          <p>No workspace data available</p>
        </div>
      }

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-btn">📄 Create Document</button>
          <button class="action-btn">✓ New Task</button>
          <button class="action-btn">👥 Invite Member</button>
          <button class="action-btn">⚙️ Settings</button>
        </div>
      </div>

      <div class="recent-activity">
        <h2>Recent Activity</h2>
        @if (overviewStore.recentActivity()?.length) {
          <div class="activity-list">
            @for (activity of overviewStore.recentActivity(); track activity.id) {
              <div class="activity-item">
                <span class="activity-icon">{{ getActivityIcon(activity.type) }}</span>
                <div class="activity-content">
                  <div class="activity-description">{{ activity.description }}</div>
                  <div class="activity-meta">
                    {{ activity.actorName }} • {{ formatDate(activity.timestamp) }}
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="empty-state">No recent activity to display</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .overview-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      color: #333;
    }

    h2 {
      font-size: 1.5rem;
      margin: 2rem 0 1rem;
      color: #444;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #667eea;
    }

    .context-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .context-info h2 {
      color: white;
      margin-top: 0;
      font-size: 1.2rem;
    }

    .context-info p {
      margin: 0.5rem 0;
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .stat-card h3 {
      margin: 0 0 1rem;
      font-size: 1rem;
      color: #666;
      font-weight: 600;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-value.success {
      color: #10b981;
      font-size: 1.5rem;
    }

    .stat-value.warning {
      color: #f59e0b;
      font-size: 1.5rem;
    }

    .stat-value.critical {
      color: #ef4444;
      font-size: 1.5rem;
    }

    .stat-label {
      margin: 0;
      color: #888;
      font-size: 0.9rem;
    }

    .health-issues {
      margin-top: 0.5rem;
      color: #ef4444;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .usage-section {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .usage-section h2 {
      margin-top: 0;
    }

    .usage-grid {
      display: grid;
      gap: 1.5rem;
    }

    .usage-card {
      padding: 1rem;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .usage-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #333;
    }

    .usage-percent {
      color: #667eea;
      font-size: 0.9rem;
    }

    .usage-bar {
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .usage-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .usage-detail {
      margin: 0;
      font-size: 0.85rem;
      color: #666;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .action-btn {
      background: white;
      border: 2px solid #667eea;
      color: #667eea;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .action-btn:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .recent-activity {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1.5rem;
    }

    .recent-activity h2 {
      margin-top: 0;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background: #fafafa;
      transition: background 0.2s;
    }

    .activity-item:hover {
      background: #f5f5f5;
    }

    .activity-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .activity-content {
      flex: 1;
    }

    .activity-description {
      font-weight: 500;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .activity-meta {
      font-size: 0.85rem;
      color: #888;
    }

    .empty-state {
      text-align: center;
      color: #999;
      padding: 2rem;
      font-style: italic;
    }
  `]
})
export class OverviewComponent {
  protected contextStore = inject<ContextStoreInstance>(ContextStore);
  protected overviewStore = inject(OverviewStore);

  constructor() {
    // Load overview data when workspace context changes
    effect(() => {
      const workspaceId = this.contextStore.currentContextId();
      if (workspaceId) {
        this.overviewStore.loadOverview(workspaceId);
      }
    });
  }

  getHealthIcon(): string {
    const status = this.overviewStore.healthStatus()?.overall;
    switch (status) {
      case 'healthy': return '✓';
      case 'warning': return '⚠';
      case 'critical': return '✗';
      default: return '?';
    }
  }

  getHealthLabel(): string {
    const status = this.overviewStore.healthStatus()?.overall;
    switch (status) {
      case 'healthy': return 'Healthy';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'task_created': return '✓';
      case 'task_completed': return '✅';
      case 'document_uploaded': return '📄';
      case 'member_joined': return '👥';
      case 'permission_changed': return '🔒';
      case 'setting_updated': return '⚙️';
      default: return '📌';
    }
  }

  getHealthIssuesCount(): number {
    return this.overviewStore.healthStatus()?.issues?.length ?? 0;
  }
}
