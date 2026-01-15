import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Create Account</h1>
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter your email"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            />
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <span class="error-message">Please enter a valid email</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password (min 6 characters)"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            />
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <span class="error-message">Password must be at least 6 characters</span>
            }
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              placeholder="Confirm your password"
              [class.error]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
            />
            @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
              <span class="error-message">Passwords must match</span>
            }
          </div>

          @if (authStore.error()) {
            <div class="alert alert-error">
              {{ authStore.error() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="registerForm.invalid || authStore.isLoading()"
            class="btn btn-primary"
          >
            @if (authStore.isLoading()) {
              <span>Creating account...</span>
            } @else {
              <span>Register</span>
            }
          </button>
        </form>

        <div class="auth-links">
          <a routerLink="/login">Already have an account? Login</a>
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
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected authStore = inject(AuthStore);

  constructor() {
    // Redirect once the user is authenticated (zone-less reactive)
    effect(
      () => {
        if (this.authStore.isAuthenticated()) {
          this.router.navigate(['/dashboard']);
        }
      },
      { allowSignalWrites: true }
    );
  }

  registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  }, {
    validators: this.passwordMatchValidator
  });

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      this.authStore.register({ email, password }).then(() => {
        if (this.authStore.isAuthenticated()) {
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }
}
