import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth/stores/auth.store';
import { AuthService } from './core/auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
})
export class AppComponent implements OnInit {
  private authStore = inject(AuthStore);
  private authService = inject(AuthService);

  ngOnInit(): void {
    // Listen to auth state changes
    this.authService.authState$.subscribe((user) => {
      this.authStore.setUser(user);
    });
  }
}
