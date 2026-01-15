import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Login</h1>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="error-message">Please enter a valid email</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="error-message">Password is required</span>
            }
          </div>

          @if (authStore.error()) {
            <div class="alert alert-error">
              {{ authStore.error() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loginForm.invalid || authStore.isLoading()"
            class="btn btn-primary"
          >
            @if (authStore.isLoading()) {
              <span>Logging in...</span>
            } @else {
              <span>Login</span>
            }
          </button>
        </form>

        <div class="auth-links">
          <a routerLink="/forgot-password">Forgot Password?</a>
          <a routerLink="/register">Don't have an account? Register</a>
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
      margin: 0 0 30px;
      color: #333;
      text-align: center;
      font-size: 28px;
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
      display: flex;
      flex-direction: column;
      gap: 10px;
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
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected authStore = inject(AuthStore);

  constructor() {
    // Navigate reactively once authentication succeeds (zone-less friendly)
    effect(
      () => {
        if (this.authStore.isAuthenticated()) {
          this.router.navigate(['/dashboard']);
        }
      },
      { allowSignalWrites: true }
    );
  }

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authStore.login({ email, password }).then(() => {
        if (this.authStore.isAuthenticated()) {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }
}
