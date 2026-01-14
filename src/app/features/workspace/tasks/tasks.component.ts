import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>✓ Tasks</h1>
      <p>Work management system for tasks, workflows, and status tracking.</p>
      <p class="coming-soon">Coming soon...</p>
    </div>
  `,
  styles: [`
    .module-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #333;
    }
    .coming-soon {
      color: #667eea;
      font-style: italic;
      margin-top: 2rem;
    }
  `]
})
export class TasksComponent {}
