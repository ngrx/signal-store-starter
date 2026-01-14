import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Reset Password</h1>
        <p class="subtitle">Enter your email address and we'll send you a link to reset your password.</p>
        
        @if (!emailSent()) {
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                placeholder="Enter your email"
                [class.error]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
              />
              @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
                <span class="error-message">Please enter a valid email</span>
              }
            </div>

            @if (authStore.error()) {
              <div class="alert alert-error">
                {{ authStore.error() }}
              </div>
            }

            <button
              type="submit"
              [disabled]="forgotPasswordForm.invalid || authStore.isLoading()"
              class="btn btn-primary"
            >
              @if (authStore.isLoading()) {
                <span>Sending...</span>
              } @else {
                <span>Send Reset Link</span>
              }
            </button>
          </form>
        } @else {
          <div class="alert alert-success">
            <p>Password reset email sent! Please check your inbox.</p>
          </div>
        }

        <div class="auth-links">
          <a routerLink="/login">Back to Login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .auth-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      margin: 0 0 10px;
      color: #333;
      text-align: center;
      font-size: 28px;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    input.error {
      border-color: #e53e3e;
    }

    .error-message {
      display: block;
      color: #e53e3e;
      font-size: 12px;
      margin-top: 4px;
    }

    .alert {
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 20px;
    }

    .alert-error {
      background-color: #fee;
      color: #c53030;
      border: 1px solid #feb2b2;
    }

    .alert-success {
      background-color: #f0fdf4;
      color: #166534;
      border: 1px solid #86efac;
    }

    .btn {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .btn-primary {
      background-color: #667eea;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #5568d3;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .auth-links {
      margin-top: 20px;
      text-align: center;
    }

    .auth-links a {
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }

    .auth-links a:hover {
      text-decoration: underline;
    }
  `],
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  protected authStore = inject(AuthStore);
  protected emailSent = signal(false);

  forgotPasswordForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      const { email } = this.forgotPasswordForm.value;
      this.authStore.resetPassword({ email }).then(() => {
        if (!this.authStore.error()) {
          this.emailSent.set(true);
        }
      });
    }
  }
}
