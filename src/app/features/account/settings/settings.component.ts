import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <h1>Account Settings</h1>
      @if (userEmail) {
        <div class="card">
          <p>Signed in as {{ userEmail }}</p>
          <button class="primary" (click)="triggerVerify()">Send verification email</button>
          <button (click)="logout()">Logout</button>
        </div>
      } @else {
        <p>No active session.</p>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px; }
    .card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; background: #fff; display: flex; flex-direction: column; gap: 8px; }
    .primary { background: #4f46e5; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; }
    button { border: 1px solid #e0e0e0; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
  `],
})
export class AccountSettingsComponent {
  private authStore = inject(AuthStore);
  protected userEmail: string | null = null;

  constructor() {
    effect(
      () => {
        const user = this.authStore.user();
        this.userEmail = user?.email ?? null;
      },
      { allowSignalWrites: true }
    );
  }

  triggerVerify(): void {
    this.authStore.verifyEmail();
  }

  logout(): void {
    this.authStore.logout();
  }
}
