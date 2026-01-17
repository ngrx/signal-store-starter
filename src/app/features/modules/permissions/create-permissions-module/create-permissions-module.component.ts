import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WorkspaceStore, WorkspaceStoreInstance } from '../../../../core/workspace/stores/workspace.store';

@Component({
  selector: 'app-create-permissions-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-permissions-module.component.html',
  styleUrls: ['./create-permissions-module.component.scss']
})
export class CreatePermissionsModuleComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  protected store = inject<WorkspaceStoreInstance>(WorkspaceStore);

  createForm: FormGroup = this.fb.group({
    // TODO: Add form controls for PermissionsModule
  });

  constructor() {
    // Reactive effects for store updates
    effect(() => {
      if (this.store.error && this.store.error()) {
        console.error('PermissionsModule create error:', this.store.error());
      }
    }, { allowSignalWrites: true });
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      // TODO: Implement create PermissionsModule logic
      console.log('create PermissionsModule:', this.createForm.value);
    }
  }

  onCancel(): void {
    this.router.navigate(['..']);
  }
}
