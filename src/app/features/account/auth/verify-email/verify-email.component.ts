import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Verify your email</h1>
        <p>Send a verification link to confirm your account.</p>
        <button (click)="send()" [disabled]="authStore.isLoading()">Send verification email</button>
        @if (message) {
          <p class="success">{{ message }}</p>
        }
        @if (authStore.error()) {
          <p class="error">{{ authStore.error() }}</p>
        }
        <a routerLink="/dashboard">Return to dashboard</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display:flex; justify-content:center; align-items:center; min-height:70vh; background:#f5f5f5; }
    .auth-card { background:white; padding:24px; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.08); text-align:center; width:360px; }
    button { padding:10px 12px; border:none; border-radius:8px; background:#4f46e5; color:white; font-weight:700; cursor:pointer; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .success { color:#166534; margin:12px 0 0; }
    .error { color:#c53030; margin:12px 0 0; }
    a { display:block; margin-top:16px; color:#4f46e5; text-decoration:none; font-weight:600; }
  `],
})
export class VerifyEmailComponent {
  protected authStore = inject(AuthStore);
  protected message = '';

  async send(): Promise<void> {
    this.message = '';
    await this.authStore.verifyEmail();
    if (!this.authStore.error()) {
      this.message = 'Verification email sent.';
    }
  }
}
