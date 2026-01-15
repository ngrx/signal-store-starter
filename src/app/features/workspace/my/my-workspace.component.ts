import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore } from '../../../core/context/stores/context.store';
import { WorkspaceStore } from '../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-workspace">
      <h1>My Workspace</h1>
      <p class="lead">
        Manage and switch across all available workspaces (User / Organization / Team / Partner).
      </p>

      <section class="section">
        <header>
          <h2>Personal</h2>
          <button class="link" (click)="refresh()">Refresh</button>
        </header>
        @if (groups().user.length === 0) {
          <p class="empty">No personal workspace detected.</p>
        } @else {
          @for (ws of groups().user; track ws.id) {
            <button class="workspace-card" [class.active]="ws.id === activeId()" (click)="activate(ws.id)">
              <div class="title">{{ ws.name }}</div>
              <div class="meta">Scope: USER</div>
            </button>
          }
        }
      </section>

      <section class="section">
        <header>
          <h2>Organizations</h2>
        </header>
        @if (groups().organization.length === 0) {
          <p class="empty">No organizations available for this account.</p>
        } @else {
          <div class="grid">
            @for (ws of groups().organization; track ws.id) {
              <button class="workspace-card" [class.active]="ws.id === activeId()" (click)="activate(ws.id)">
                <div class="title">{{ ws.name }}</div>
                <div class="meta">Scope: ORG • Capabilities: {{ ws.capabilities.length }}</div>
              </button>
            }
          </div>
        }
      </section>

      <section class="section">
        <header>
          <h2>Teams</h2>
        </header>
        @if (groups().team.length === 0) {
          <p class="empty">No teams available.</p>
        } @else {
          <div class="grid">
            @for (ws of groups().team; track ws.id) {
              <button class="workspace-card" [class.active]="ws.id === activeId()" (click)="activate(ws.id)">
                <div class="title">{{ ws.name }}</div>
                <div class="meta">Scope: TEAM</div>
              </button>
            }
          </div>
        }
      </section>

      <section class="section">
        <header>
          <h2>Partners</h2>
        </header>
        @if (groups().partner.length === 0) {
          <p class="empty">No partner workspaces.</p>
        } @else {
          <div class="grid">
            @for (ws of groups().partner; track ws.id) {
              <button class="workspace-card" [class.active]="ws.id === activeId()" (click)="activate(ws.id)">
                <div class="title">{{ ws.name }}</div>
                <div class="meta">Scope: PARTNER</div>
              </button>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .my-workspace {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 0.5rem;
      font-size: 2rem;
    }
    .lead {
      color: #555;
      margin-bottom: 1.5rem;
    }
    .section {
      margin-bottom: 1.5rem;
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .workspace-card {
      width: 100%;
      text-align: left;
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      background: #f8fafc;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .workspace-card.active {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }
    .title {
      font-weight: 700;
      margin-bottom: 4px;
    }
    .meta {
      font-size: 12px;
      color: #666;
    }
    .grid {
      display: grid;
      gap: 12px;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }
    .empty {
      color: #777;
      font-style: italic;
      margin: 0;
    }
    .link {
      border: none;
      background: none;
      color: #667eea;
      cursor: pointer;
      font-weight: 600;
    }
  `],
})
export class MyWorkspaceComponent {
  private contextStore = inject(ContextStore);
  private workspaceStore = inject(WorkspaceStore);
  protected groups = signal(this.workspaceStore.byScope());
  protected activeId = signal(this.workspaceStore.activeWorkspaceId());

  constructor() {
    effect(
      () => {
        this.contextStore.available();
        this.workspaceStore.syncFromContext();
        this.groups.set(this.workspaceStore.byScope());
        this.activeId.set(this.workspaceStore.activeWorkspaceId());
      },
      { allowSignalWrites: true }
    );
  }

  activate(workspaceId: string): void {
    const workspace = this.workspaceStore
      .workspaces()
      .find((ws) => ws.id === workspaceId);
    if (workspace) {
      this.workspaceStore.switchWorkspace(workspace);
      this.activeId.set(workspaceId);
    }
  }

  refresh(): void {
    this.workspaceStore.syncFromContext();
    this.groups.set(this.workspaceStore.byScope());
    this.activeId.set(this.workspaceStore.activeWorkspaceId());
  }
}
