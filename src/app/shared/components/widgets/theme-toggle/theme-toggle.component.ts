import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutStore } from '../../../../core/global-shell/stores/layout.store';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle" (click)="toggleTheme()" title="Toggle theme">
      {{ layoutStore.isDarkMode() ? '☀️' : '🌙' }}
    </button>
  `,
  styles: [`
    .theme-toggle {
      padding: 8px 12px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .theme-toggle:hover {
      border-color: #667eea;
      background: #f8f9ff;
      transform: scale(1.1);
    }
  `],
})
export class ThemeToggleComponent {
  protected layoutStore = inject(LayoutStore);

  toggleTheme(): void {
    this.layoutStore.toggleTheme();
  }
}
