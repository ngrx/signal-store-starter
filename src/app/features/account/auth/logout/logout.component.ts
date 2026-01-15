import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthStore, AuthStoreInstance } from '../../../../core/auth/stores/auth.store';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h1>Signing out</h1>
        <p>You will be redirected shortly.</p>
        <a routerLink="/login">Back to login</a>
      </div>
    </div>
  `,
  styles: [`
    .auth-container { display:flex; justify-content:center; align-items:center; min-height:70vh; background:#f5f5f5; }
    .auth-card { background:white; padding:24px; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.08); text-align:center; width:320px; }
    h1 { margin:0 0 8px; }
    p { margin:0 0 12px; color:#555; }
    a { color:#4f46e5; text-decoration:none; font-weight:600; }
  `],
})
export class LogoutComponent {
  private authStore = inject<AuthStoreInstance>(AuthStore);
  private router = inject(Router);

  constructor() {
    effect(
      () => {
        this.authStore.logout().then(() => this.router.navigate(['/login']));
      },
      { allowSignalWrites: true }
    );
  }
}
