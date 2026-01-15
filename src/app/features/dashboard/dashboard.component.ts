import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthStore } from '../../core/auth/stores/auth.store';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { ContextStore } from '../../core/context/stores/context.store';
import { ProjectStore } from '../../core/project/stores/project.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ReactiveFormsModule],
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

        <section class="creator-grid">
          <article class="card">
            <div class="card-icon">🏢</div>
            <h3>Create Organization</h3>
            <form [formGroup]="orgForm" (ngSubmit)="createOrganization()">
              <label>
                Name
                <input formControlName="name" placeholder="Org name" />
              </label>
              <label>
                Description
                <input formControlName="description" placeholder="Optional description" />
              </label>
              <button class="primary" type="submit" [disabled]="orgForm.invalid">Create</button>
            </form>
          </article>

          <article class="card">
            <div class="card-icon">👥</div>
            <h3>Create Team</h3>
            <form [formGroup]="teamForm" (ngSubmit)="createTeam()">
              <label>
                Name
                <input formControlName="name" placeholder="Team name" />
              </label>
              <label>
                Description
                <input formControlName="description" placeholder="Optional description" />
              </label>
              <button class="primary" type="submit" [disabled]="teamForm.invalid">Create</button>
              <p class="hint">Uses current organization context when not specified.</p>
            </form>
          </article>

          <article class="card">
            <div class="card-icon">🤝</div>
            <h3>Create Partner</h3>
            <form [formGroup]="partnerForm" (ngSubmit)="createPartner()">
              <label>
                Name
                <input formControlName="name" placeholder="Partner name" />
              </label>
              <label>
                Description
                <input formControlName="description" placeholder="Optional description" />
              </label>
              <button class="primary" type="submit" [disabled]="partnerForm.invalid">Create</button>
            </form>
          </article>

          <article class="card">
            <div class="card-icon">📁</div>
            <h3>Create Project</h3>
            <form [formGroup]="projectForm" (ngSubmit)="createProject()">
              <label>
                Name
                <input formControlName="name" placeholder="Project name" />
              </label>
              <label>
                Description
                <input formControlName="description" placeholder="Optional description" />
              </label>
              <button class="primary" type="submit" [disabled]="projectForm.invalid || projectStore.isLoading()">Create</button>
              @if (projectStore.error()) {
                <p class="error">{{ projectStore.error() }}</p>
              }
            </form>
          </article>
        </section>

        @if (toast()) {
          <div class="toast">{{ toast() }}</div>
        }
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

    .creator-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s, box-shadow 0.2s;
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

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }

    label {
      font-size: 13px;
      color: #444;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    input {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      font-size: 14px;
    }

    .primary {
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .hint {
      color: #777;
      font-size: 12px;
      margin: 0;
    }

    .error {
      color: #c53030;
      margin: 0;
      font-size: 12px;
    }

    .toast {
      margin-top: 24px;
      background: #ecfdf3;
      color: #166534;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 12px 16px;
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .creator-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class DashboardComponent implements OnDestroy {
  protected authStore = inject(AuthStore);
  private fb = inject(FormBuilder);
  protected contextStore = inject(ContextStore);
  protected projectStore = inject(ProjectStore);
  protected toast = signal('');
  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly toastDurationMs = 2500;
  private readonly toastMessages = {
    orgCreated: 'Organization created and set as current context.',
    teamCreated: 'Team created and set as current context.',
    partnerCreated: 'Partner created.',
    projectCreated: 'Project created.',
  };

  orgForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  teamForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  partnerForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  projectForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
  });

  createOrganization(): void {
    if (this.orgForm.invalid) return;
    this.contextStore.createOrganization(this.orgForm.getRawValue());
    this.orgForm.reset();
    this.showToast(this.toastMessages.orgCreated);
  }

  createTeam(): void {
    if (this.teamForm.invalid) return;
    this.contextStore.createTeam(this.teamForm.getRawValue());
    this.teamForm.reset();
    this.showToast(this.toastMessages.teamCreated);
  }

  createPartner(): void {
    if (this.partnerForm.invalid) return;
    this.contextStore.createPartner(this.partnerForm.getRawValue());
    this.partnerForm.reset();
    this.showToast(this.toastMessages.partnerCreated);
  }

  createProject(): void {
    if (this.projectForm.invalid) return;
    const context = this.contextStore.current();
    const base = this.projectForm.getRawValue();
    const payload = {
      name: base.name,
      ...(base.description ? { description: base.description } : {}),
      ...(context?.type === 'organization' ? { organizationId: context.organizationId } : {}),
      ...(context?.type === 'team' ? { teamId: context.teamId } : {}),
    };
    this.projectStore.createProject(payload);
    this.projectForm.reset();
    this.showToast(this.toastMessages.projectCreated);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => this.toast.set(''), this.toastDurationMs);
  }

  ngOnDestroy(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
  }
}
