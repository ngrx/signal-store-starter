import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-account-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>Account Profile</h1>
      @if (userEmail) {
        <div class="card">
          <div><strong>Email:</strong> {{ userEmail }}</div>
          <div><strong>Name:</strong> {{ displayName || 'N/A' }}</div>
        </div>
      } @else {
        <p>No user signed in.</p>
      }
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 640px; margin: 0 auto; }
    .card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; background: #fff; }
  `],
})
export class AccountProfileComponent {
  private authStore = inject(AuthStore);
  protected userEmail: string | null = null;
  protected displayName: string | null = null;

  constructor() {
    effect(
      () => {
        const user = this.authStore.user();
        this.userEmail = user?.email ?? null;
        this.displayName = user?.displayName ?? null;
      },
      { allowSignalWrites: true }
    );
  }
}
