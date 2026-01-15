import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore, AuthStoreInstance } from '../../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Reset Password</h1>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <label>
            Email
            <input type="email" formControlName="email" placeholder="you@example.com" />
          </label>
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <p class="error">Enter a valid email.</p>
          }
          <button type="submit" [disabled]="form.invalid || authStore.isLoading()">Send reset link</button>
          @if (message) {
            <p class="success">{{ message }}</p>
          }
          @if (authStore.error()) {
            <p class="error">{{ authStore.error() }}</p>
          }
        </form>
        <a routerLink="/login">Back to login</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display:flex; justify-content:center; align-items:center; min-height:80vh; background:#f5f5f5; }
    .auth-card { background:white; padding:24px; border-radius:12px; width:360px; box-shadow:0 4px 20px rgba(0,0,0,0.08); display:flex; flex-direction:column; gap:12px; }
    h1 { margin:0 0 8px; font-size:22px; }
    label { display:flex; flex-direction:column; gap:6px; font-weight:600; color:#333; }
    input { padding:10px; border-radius:8px; border:1px solid #ddd; }
    button { padding:10px 12px; border:none; border-radius:8px; background:#4f46e5; color:white; font-weight:700; cursor:pointer; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .error { color:#c53030; margin:0; font-size:13px; }
    .success { color:#166534; margin:0; font-size:13px; }
    a { color:#4f46e5; text-decoration:none; font-weight:600; }
  `],
})
export class ResetPasswordComponent {
  protected authStore = inject<AuthStoreInstance>(AuthStore);
  private fb = inject(FormBuilder);
  protected message = '';

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.message = '';
    await this.authStore.resetPassword(this.form.getRawValue());
    if (!this.authStore.error()) {
      this.message = 'Reset link sent. Check your inbox.';
    }
  }
}
