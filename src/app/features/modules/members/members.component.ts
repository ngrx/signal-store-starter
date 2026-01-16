import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextStore, ContextStoreInstance } from '../../../core/context/stores/context.store';
import { MembersStore } from '../../../core/workspace/stores/members.store';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>👥 Members</h1>
      <p>Identity mapping for users, teams, partners, and role management.</p>
      
      @if (membersStore.isLoading()) {
        <div class="loading">Loading members...</div>
      } @else {
        <div class="stats-bar">
          <div class="stat-item">
            <div class="stat-value">{{ membersStore.totalMembers() }}</div>
            <div class="stat-label">Total Members</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ membersStore.activeMembers() }}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ membersStore.pendingInvitations() }}</div>
            <div class="stat-label">Pending Invites</div>
          </div>
        </div>

        <!-- Members by Role -->
        <div class="role-sections">
          @if (membersStore.owners().length > 0) {
            <div class="role-section">
              <h2>👑 Owners ({{ membersStore.owners().length }})</h2>
              <div class="members-grid">
                @for (member of membersStore.owners(); track member.id) {
                  <div class="member-card" [class.selected]="member.id === membersStore.selectedMemberId()"
                       (click)="membersStore.selectMember(member.id)">
                    <div class="member-avatar">{{ getInitials(member.displayName) }}</div>
                    <div class="member-info">
                      <div class="member-name">{{ member.displayName }}</div>
                      <div class="member-email">{{ member.email }}</div>
                      <div class="member-role-badge owner">Owner</div>
                    </div>
                    <div class="member-status" [class.active]="member.status === 'Active'">
                      {{ member.status }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (membersStore.admins().length > 0) {
            <div class="role-section">
              <h2>⚙️ Admins ({{ membersStore.admins().length }})</h2>
              <div class="members-grid">
                @for (member of membersStore.admins(); track member.id) {
                  <div class="member-card" [class.selected]="member.id === membersStore.selectedMemberId()"
                       (click)="membersStore.selectMember(member.id)">
                    <div class="member-avatar">{{ getInitials(member.displayName) }}</div>
                    <div class="member-info">
                      <div class="member-name">{{ member.displayName }}</div>
                      <div class="member-email">{{ member.email }}</div>
                      <div class="member-role-badge admin">Admin</div>
                    </div>
                    <div class="member-status" [class.active]="member.status === 'Active'">
                      {{ member.status }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (membersStore.regularMembers().length > 0) {
            <div class="role-section">
              <h2>👤 Members ({{ membersStore.regularMembers().length }})</h2>
              <div class="members-grid">
                @for (member of membersStore.regularMembers(); track member.id) {
                  <div class="member-card" [class.selected]="member.id === membersStore.selectedMemberId()"
                       (click)="membersStore.selectMember(member.id)">
                    <div class="member-avatar">{{ getInitials(member.displayName) }}</div>
                    <div class="member-info">
                      <div class="member-name">{{ member.displayName }}</div>
                      <div class="member-email">{{ member.email }}</div>
                      <div class="member-role-badge member">Member</div>
                    </div>
                    <div class="member-status" [class.active]="member.status === 'Active'">
                      {{ member.status }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @if (membersStore.guests().length > 0) {
            <div class="role-section">
              <h2>🎫 Guests ({{ membersStore.guests().length }})</h2>
              <div class="members-grid">
                @for (member of membersStore.guests(); track member.id) {
                  <div class="member-card" [class.selected]="member.id === membersStore.selectedMemberId()"
                       (click)="membersStore.selectMember(member.id)">
                    <div class="member-avatar">{{ getInitials(member.displayName) }}</div>
                    <div class="member-info">
                      <div class="member-name">{{ member.displayName }}</div>
                      <div class="member-email">{{ member.email }}</div>
                      <div class="member-role-badge guest">Guest</div>
                    </div>
                    <div class="member-status" [class.active]="member.status === 'Active'">
                      {{ member.status }}
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Pending Invitations -->
        @if (membersStore.invitations().length > 0) {
          <div class="invitations-section">
            <h2>📨 Pending Invitations ({{ membersStore.pendingInvitations() }})</h2>
            <div class="invitations-list">
              @for (invitation of membersStore.invitations(); track invitation.id) {
                @if (invitation.status === 'pending') {
                  <div class="invitation-card">
                    <div class="invitation-info">
                      <div class="invitation-email">{{ invitation.email }}</div>
                      <div class="invitation-meta">
                        Invited by {{ invitation.invitedByName }} • 
                        Role: {{ invitation.targetRole }}
                      </div>
                    </div>
                    <div class="invitation-status pending">Pending</div>
                  </div>
                }
              }
            </div>
          </div>
        }

        @if (membersStore.totalMembers() === 0) {
          <div class="empty-state">
            <p>No members found</p>
            <button class="action-btn">+ Invite Members</button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .module-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    h2 {
      font-size: 1.3rem;
      margin: 2rem 0 1rem;
      color: #444;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      font-size: 1.2rem;
      color: #667eea;
    }

    .stats-bar {
      display: flex;
      gap: 2rem;
      margin: 2rem 0;
      padding: 1.5rem;
      background: white;
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .stat-item {
      flex: 1;
      text-align: center;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #667eea;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }

    .role-sections {
      margin-top: 2rem;
    }

    .role-section {
      margin-bottom: 2rem;
    }

    .members-grid {
      display: grid;
      gap: 1rem;
    }

    .member-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .member-card:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }

    .member-card.selected {
      border-color: #667eea;
      background: #f8f9ff;
    }

    .member-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .member-info {
      flex: 1;
    }

    .member-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .member-email {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 0.25rem;
    }

    .member-role-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .member-role-badge.owner {
      background: #fef3c7;
      color: #92400e;
    }

    .member-role-badge.admin {
      background: #dbeafe;
      color: #1e40af;
    }

    .member-role-badge.member {
      background: #d1fae5;
      color: #065f46;
    }

    .member-role-badge.guest {
      background: #e5e7eb;
      color: #374151;
    }

    .member-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
      background: #e5e7eb;
      color: #6b7280;
    }

    .member-status.active {
      background: #d1fae5;
      color: #065f46;
    }

    .invitations-section {
      margin-top: 2rem;
    }

    .invitations-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .invitation-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .invitation-info {
      flex: 1;
    }

    .invitation-email {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .invitation-meta {
      font-size: 0.85rem;
      color: #666;
    }

    .invitation-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .invitation-status.pending {
      background: #fef3c7;
      color: #92400e;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
    }

    .empty-state p {
      color: #999;
      font-style: italic;
      margin-bottom: 1rem;
    }

    .action-btn {
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .coming-soon {
      color: #667eea;
      font-style: italic;
      margin-top: 2rem;
    }
  `]
})
export class MembersComponent {
  protected contextStore = inject<ContextStoreInstance>(ContextStore);
  protected membersStore = inject(MembersStore);

  constructor() {
    // Load members when workspace context changes
    effect(() => {
      const workspaceId = this.contextStore.currentContextId();
      if (workspaceId) {
        this.membersStore.loadMembers(workspaceId);
        this.membersStore.loadInvitations(workspaceId);
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
