import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore } from '../../../core/context/stores/context.store';

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

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Health Status</h3>
          <div class="stat-value success">✓ Healthy</div>
          <p class="stat-label">System operational</p>
        </div>

        <div class="stat-card">
          <h3>Usage</h3>
          <div class="stat-value">0</div>
          <p class="stat-label">Active items</p>
        </div>

        <div class="stat-card">
          <h3>Activity</h3>
          <div class="stat-value">0</div>
          <p class="stat-label">Recent events</p>
        </div>

        <div class="stat-card">
          <h3>Members</h3>
          <div class="stat-value">1</div>
          <p class="stat-label">Active users</p>
        </div>
      </div>

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
        <p class="empty-state">No recent activity to display</p>
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

    .stat-label {
      margin: 0;
      color: #888;
      font-size: 0.9rem;
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

    .empty-state {
      text-align: center;
      color: #999;
      padding: 2rem;
      font-style: italic;
    }
  `]
})
export class OverviewComponent {
  contextStore = inject(ContextStore);
}
