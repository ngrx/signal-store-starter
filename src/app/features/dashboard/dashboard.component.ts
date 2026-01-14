import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthStore } from '../../core/auth/stores/auth.store';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="dashboard">
      <app-header></app-header>
      
      <main class="dashboard-content">
        <div class="welcome-section">
          <h1>Welcome to Dashboard</h1>
          @if (authStore.user()) {
            <p class="user-email">Logged in as: {{ authStore.user()?.email }}</p>
          }
        </div>

        <div class="cards-grid">
          <div class="card">
            <div class="card-icon">📊</div>
            <h3>Analytics</h3>
            <p>View your performance metrics and insights</p>
          </div>

          <div class="card">
            <div class="card-icon">📁</div>
            <h3>Projects</h3>
            <p>Manage and organize your projects</p>
          </div>

          <div class="card">
            <div class="card-icon">👥</div>
            <h3>Team</h3>
            <p>Collaborate with team members</p>
          </div>

          <div class="card">
            <div class="card-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Customize your preferences</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard {
      min-height: 100vh;
      background-color: #f5f5f5;
    }

    .dashboard-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .welcome-section {
      margin-bottom: 40px;
    }

    h1 {
      font-size: 32px;
      color: #333;
      margin: 0 0 10px;
    }

    .user-email {
      color: #666;
      font-size: 14px;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .card {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .card-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .card h3 {
      margin: 0 0 8px;
      color: #333;
      font-size: 20px;
    }

    .card p {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .cards-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class DashboardComponent {
  protected authStore = inject(AuthStore);
  private router = inject(Router);
}
