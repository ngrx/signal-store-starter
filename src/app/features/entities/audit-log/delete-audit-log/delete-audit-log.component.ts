import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-delete-audit-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './delete-audit-log.component.html',
  styleUrls: ['./delete-audit-log.component.scss']
})
export class DeleteAuditLogComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<WorkspaceStoreInstance>(WorkspaceStore);

  deleteForm: FormGroup = this.fb.group({
    // TODO: Add form controls for AuditLog
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('AuditLog delete error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.deleteForm.valid) {
      // TODO: Implement delete AuditLog logic
      console.log('delete AuditLog:', this.deleteForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
