import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-my-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="wrapper">
      <header>
        <h1>My Workspaces</h1>
        <p>Expand any workspace to view quick links.</p>
      </header>

      @if (workspaces().length === 0) {
        <div class="empty">No workspaces available yet.</div>
      } @else {
        <div class="workspace-list">
          @for (workspace of workspaces(); track workspace.id) {
            <article class="workspace-card">
              <div class="workspace-header" (click)="toggle(workspace.id)">
                <div>
                  <h3>{{ workspace.name }}</h3>
                  <p class="meta">{{ workspace.type || 'personal' }}</p>
                </div>
                <button class="toggle" type="button">
                  {{ expanded().has(workspace.id) ? '−' : '+' }}
                </button>
              </div>
              @if (expanded().has(workspace.id)) {
                <div class="workspace-body">
                  <p>{{ workspace.description || 'No description' }}</p>
                  <div class="links">
                    <a [routerLink]="['/workspace', workspace.id, 'overview']">Overview</a>
                    <a [routerLink]="['/workspace', workspace.id, 'documents']">Documents</a>
                    <a [routerLink]="['/workspace', workspace.id, 'tasks']">Tasks</a>
                  </div>
                </div>
              }
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .wrapper { padding:24px; max-width:960px; margin:0 auto; display:flex; flex-direction:column; gap:16px; }
    header h1 { margin:0; }
    header p { margin:0; color:#555; }
    .workspace-list { display:flex; flex-direction:column; gap:12px; }
    .workspace-card { background:white; border:1px solid #e5e7eb; border-radius:12px; padding:12px; box-shadow:0 2px 6px rgba(0,0,0,0.04); }
    .workspace-header { display:flex; justify-content:space-between; align-items:center; cursor:pointer; }
    .workspace-header h3 { margin:0; }
    .workspace-header .meta { margin:4px 0 0; color:#6b7280; font-size:13px; }
    .workspace-body { margin-top:8px; color:#374151; }
    .links { display:flex; gap:12px; margin-top:8px; }
    .links a { color:#4f46e5; text-decoration:none; font-weight:600; }
    .empty { padding:16px; background:#f9fafb; border:1px dashed #d1d5db; border-radius:12px; text-align:center; color:#6b7280; }
    .toggle { border:none; background:#eef2ff; color:#4338ca; border-radius:8px; padding:6px 10px; font-weight:700; cursor:pointer; }
  `],
})
export class MyWorkspaceComponent {
  private workspaceStore = inject<WorkspaceStoreInstance>(WorkspaceStore);
  protected workspaces = this.workspaceStore.workspaces;
  protected expanded = signal<Set<string>>(new Set());

  constructor() {
    effect(
      () => {
        // Ensure there is at least a personal workspace entry for display purposes
        if (this.workspaces().length === 0) {
          this.workspaceStore.ensurePersonalWorkspace();
        }
      },
      { allowSignalWrites: true }
    );
  }

  toggle(id: string): void {
    const next = new Set(this.expanded());
    next.has(id) ? next.delete(id) : next.add(id);
    this.expanded.set(next);
  }
}
