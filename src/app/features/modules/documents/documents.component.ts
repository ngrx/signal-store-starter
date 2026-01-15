import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="module-container">
      <h1>📄 Documents</h1>
      <p>Content management system for files, versions, and permissions.</p>
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
export class DocumentsComponent {}
