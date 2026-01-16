import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-delete-task-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './delete-task-module.component.html',
  styleUrls: ['./delete-task-module.component.scss']
})
export class DeleteTaskModuleComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<WorkspaceStoreInstance>(WorkspaceStore);

  deleteForm: FormGroup = this.fb.group({
    // TODO: Add form controls for TaskModule
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('TaskModule delete error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.deleteForm.valid) {
      // TODO: Implement delete TaskModule logic
      console.log('delete TaskModule:', this.deleteForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
